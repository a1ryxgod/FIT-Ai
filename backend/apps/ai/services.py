import logging
from datetime import date, timedelta

from django.conf import settings
from django.db.models import Sum

from .models import AIChatMessage

logger = logging.getLogger(__name__)


def get_user_context(user, organization):
    from apps.nutrition.models import FoodLog
    from apps.progress.models import WeightLog
    from apps.workouts.models import WorkoutSession

    latest_weight = (
        WeightLog.objects.filter(
            user=user, organization=organization, is_deleted=False
        )
        .order_by("-date")
        .values("weight")
        .first()
    )

    today = date.today()
    totals = FoodLog.objects.filter(
        user=user, organization=organization, date=today, is_deleted=False
    ).aggregate(
        calories=Sum("calories"),
        protein=Sum("protein"),
        carbs=Sum("carbs"),
        fat=Sum("fat"),
    )

    week_ago = today - timedelta(days=7)
    workout_count = WorkoutSession.objects.filter(
        user=user,
        organization=organization,
        date__gte=week_ago,
        is_deleted=False,
    ).count()

    profile = getattr(user, "profile", None)
    return {
        "weight": latest_weight["weight"] if latest_weight else None,
        "calories_today": round(totals["calories"] or 0),
        "protein_today": round(totals["protein"] or 0),
        "carbs_today": round(totals["carbs"] or 0),
        "fat_today": round(totals["fat"] or 0),
        "workouts_this_week": workout_count,
        "activity_level": profile.activity_level if profile else "medium",
    }


def _build_chat_prompt(ctx, user_message):
    weight_str = f"{ctx['weight']} kg" if ctx["weight"] is not None else "unknown"
    return (
        f"User stats:\n"
        f"- Weight: {weight_str}\n"
        f"- Calories today: {ctx['calories_today']} kcal\n"
        f"- Protein today: {ctx['protein_today']} g\n"
        f"- Carbs today: {ctx['carbs_today']} g\n"
        f"- Fat today: {ctx['fat_today']} g\n"
        f"- Workouts this week: {ctx['workouts_this_week']}\n"
        f"- Activity level: {ctx['activity_level']}\n\n"
        f"User question: {user_message}"
    )


def chat(user, organization, user_message):
    AIChatMessage.objects.create(
        user=user,
        organization=organization,
        role=AIChatMessage.Role.USER,
        message=user_message,
    )

    ctx = get_user_context(user, organization)
    user_prompt = _build_chat_prompt(ctx, user_message)

    reply = _call_openai(
        system="You are a personal fitness assistant. Be concise, motivating, and evidence-based. "
               "Give practical advice in 2-4 sentences max.",
        user_prompt=user_prompt,
    )

    AIChatMessage.objects.create(
        user=user,
        organization=organization,
        role=AIChatMessage.Role.ASSISTANT,
        message=reply,
    )

    return reply


def analyze_workouts(user, organization):
    from apps.workouts.models import WorkoutSession

    four_weeks_ago = date.today() - timedelta(weeks=4)
    sessions = (
        WorkoutSession.objects.filter(
            user=user,
            organization=organization,
            date__gte=four_weeks_ago,
            is_deleted=False,
        )
        .prefetch_related("sets__exercise")
        .order_by("date")
    )

    if not sessions.exists():
        return "No workout data found for the past 4 weeks. Start logging your workouts to get personalized analysis."

    session_lines = []
    for session in sessions:
        exercises = {}
        for ws in session.sets.all():
            name = ws.exercise.name
            if name not in exercises:
                exercises[name] = {"sets": 0, "volume": 0}
            exercises[name]["sets"] += 1
            exercises[name]["volume"] += ws.reps * ws.weight
        ex_summary = ", ".join(
            f"{name} ({data['sets']} sets, {round(data['volume'])} kg vol)"
            for name, data in exercises.items()
        )
        session_lines.append(f"- {session.date}: {ex_summary or 'no sets recorded'}")

    workout_summary = "\n".join(session_lines)
    total_sessions = sessions.count()

    user_prompt = (
        f"Training log — last 4 weeks ({total_sessions} sessions):\n"
        f"{workout_summary}\n\n"
        "Analyze training volume, frequency, and muscle balance. "
        "Suggest specific improvements in 3-5 bullet points."
    )

    return _call_openai(
        system="You are an expert strength coach. Analyze workout data and give actionable advice. "
               "Be specific, evidence-based, and concise.",
        user_prompt=user_prompt,
    )


def _call_openai(system, user_prompt):
    if not settings.OPENAI_API_KEY:
        return "AI assistant is not configured. Please set OPENAI_API_KEY to enable this feature."

    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=300,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.error("OpenAI API error: %s", exc)
        return "I'm temporarily unavailable. Please try again in a moment."
