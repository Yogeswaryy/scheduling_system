import { useState } from 'react'
import Layout from '../components/Layout'
import { currentManager } from '../data/mockData'

export default function Profile() {
  const [whatsapp, setWhatsapp] = useState('Enabled')
  const [emailApproval, setEmailApproval] = useState(true)

  return (
    <Layout
      breadcrumb="Home / Profile"
      title="Profile"
      subtitle="Manage your personal details, communication preferences and account security."
      actions={
        <>
          <button className="btn-secondary">Discard</button>
          <button className="btn-primary">Save Changes</button>
        </>
      }
    >
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-1">Update Profile</h2>
        <p className="text-xs text-gray-500 mb-4">Edit your account details and how your profile appears across the system.</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
              {currentManager.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold">{currentManager.name}</div>
              <div className="text-sm text-gray-500">{currentManager.role} • {currentManager.email}</div>
            </div>
          </div>
          <button className="btn-secondary">Change Photo</button>
        </div>
        <div className="mt-4 max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          >
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-1">Account & Security</h2>
          <p className="text-xs text-gray-500 mb-4">
            Password & WhatsApp re-verification are required every 366 days. Reminders begin about 14–30 days before expiry.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-2">
            <div className="font-medium text-sm">Password & sign-in</div>
            <div className="text-xs text-gray-500">Change password, review sessions and sign-in activity.</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="font-medium text-sm">Last login</div>
            <div className="text-xs text-gray-500">Today • 1:32 PM</div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-1">Communication Preferences</h2>
          <p className="text-xs text-gray-500 mb-4">Choose how leave updates reach you.</p>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span>WhatsApp notifications</span>
            <select className="border border-gray-300 rounded-lg px-2 py-1 text-sm">
              <option>Enabled when active</option>
              <option>Always</option>
              <option>Off</option>
            </select>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Email approval notifications</span>
            <input
              type="checkbox"
              checked={emailApproval}
              onChange={(e) => setEmailApproval(e.target.checked)}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}
