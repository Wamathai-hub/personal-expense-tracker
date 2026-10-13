import { Link } from 'react-router-dom'
import { FileX } from 'lucide-react'
import EmptyState from '../components/EmptyState'

export default function NotFound() {
  return (
    <div className="page">
      <EmptyState
        icon={FileX}
        title="Page not found"
        text="The page you're looking for doesn't exist or has moved."
        action={
          <Link to="/" className="btn btn-primary">
            Go to dashboard
          </Link>
        }
      />
    </div>
  )
}
