import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { useOrgStore } from '@/store/orgStore'
import { useMembers, useInviteMember } from '@/hooks/useMembers'

function MemberRow({ member }) {
  const initial = member.username?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-small font-black text-brand-400 shrink-0"
        style={{ background: 'rgba(var(--brand-500),0.12)' }}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 text-small truncate">{member.username}</p>
        <p className="text-caption text-slate-500 truncate">{member.email}</p>
      </div>
      <Badge color={member.role}>{member.role}</Badge>
    </div>
  )
}

export default function Members() {
  const { currentOrg } = useOrgStore()
  const { data: members = [], isLoading } = useMembers(currentOrg?.id)
  const { mutate: invite, isPending: inviting } = useInviteMember(currentOrg?.id)

  const [form, setForm] = useState({ username: '', role: 'member' })
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleInvite = (e) => {
    e.preventDefault()
    if (!form.username.trim()) return
    invite(form, {
      onSuccess: () => setForm({ username: '', role: 'member' }),
    })
  }

  return (
    <Layout title="Members">
      <Card className="mb-4">
        <CardHeader
          title="Team Members"
          subtitle={isLoading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
        />
        {isLoading ? (
          <div className="py-8 text-center text-slate-500 text-small">Loading members…</div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-small">No members yet. Invite someone below.</div>
        ) : (
          <div>
            {members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Invite Member" subtitle="Add a registered user to this gym" />
        <form onSubmit={handleInvite} className="space-y-3">
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="john_doe"
            required
          />
          <div>
            <label className="label">Role</label>
            <select name="role" className="input" value={form.role} onChange={onChange}>
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" loading={inviting} fullWidth>
            Send Invite
          </Button>
        </form>
      </Card>
    </Layout>
  )
}
