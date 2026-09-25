import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { myPendingRequestDetail } from '../data/mockData'

export default function MyLeaveRequestDetails() {
  const navigate = useNavigate()
  const d = myPendingRequestDetail

  return (
    <Layout
      title="Leave Request Details"
      subtitle="Track your own leave request while it is reviewed by higher-level management."
      actions={<span className="badge bg-gray-100 text-gray-700">{d.status}</span>}
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <h2 className="text-lg font-semibold">{d.type} · {d.dates}</h2>
          <p className="text-xs text-gray-500 mb-4">Request ID: {d.requestId}</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <div className="text-xs text-gray-500 uppercase font-medium">Duration</div>
              <div className="font-semibold">{d.duration}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-medium">Submitted</div>
              <div className="font-semibold">{d.submitted}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-medium">Current Balance</div>
              <div className="font-semibold">{d.currentBalance} days</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-medium">Balance If Approved</div>
              <div className="font-semibold">{d.balanceIfApproved} days</div>
            </div>
          </div>

          <h3 className="text-sm font-semibold mb-2">Approval Progress</h3>
          <div className="flex flex-col gap-2 mb-4">
            <div className="bg-green-100 text-green-900 rounded-lg px-4 py-2 text-sm">
              <div className="font-medium">Request submitted</div>
              <div className="text-xs opacity-70">{d.submittedAt}</div>
            </div>
            <div className="bg-amber-100 text-amber-900 rounded-lg px-4 py-2 text-sm">
              <div className="font-medium">Pending Approval</div>
              <div className="text-xs opacity-70">Current step</div>
            </div>
            <div className="bg-gray-100 text-gray-500 rounded-lg px-4 py-2 text-sm">
              <div className="font-medium">Approved / Rejected</div>
              <div className="text-xs opacity-70">Waiting for current step</div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600">
            <span className="font-medium text-gray-800">Cancellation — </span>
            Cancel request → mandatory cancellation reason required. Cancelled requests remain in history for audit.
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Approval updates</h2>
            <div className="text-sm mb-3">
              <div className="font-medium">Request submitted successfully</div>
              <div className="text-xs text-gray-500">Your higher-level approver has been notified.</div>
            </div>
            <div className="text-sm mb-4">
              <div className="font-medium">Pending approval</div>
              <div className="text-xs text-gray-500">You may cancel while pending; a cancellation reason is required.</div>
            </div>
            <button className="btn-secondary w-full">Cancel Request</button>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-2">What happens next?</h2>
            <p className="text-sm text-gray-600">
              A manager cannot approve their own leave. The request is routed to the next reporting manager or
              configured higher-level management approver. Once the final approver approves it, the balance is
              updated and the leave appears in the team calendar.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button className="btn-secondary" onClick={() => navigate('/my-leave')}>
          Back to My Leave
        </button>
      </div>
    </Layout>
  )
}
