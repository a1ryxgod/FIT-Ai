import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import TopBar from './TopBar'

export default function Layout({ children, title = 'FitTrack' }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 px-4 md:px-6 py-6 pb-24 md:pb-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
