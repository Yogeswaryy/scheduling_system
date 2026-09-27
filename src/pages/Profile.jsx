import { useRef, useState } from 'react'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import { currentManager } from '../data/mockData'

export default function Profile() {
  const [whatsapp, setWhatsapp] = useState(currentManager.whatsapp || 'Linked')
  const [emailApproval, setEmailApproval] = useState(true)
  const [photoMenu, setPhotoMenu] = useState(false)
  const [photo, setPhoto] = useState('')
  const [savedSnapshot,setSavedSnapshot]=useState({whatsapp:currentManager.whatsapp||'Linked',emailApproval:true,photo:''})
  const [viewOpen, setViewOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [passwordOpen,setPasswordOpen]=useState(false)
  const [activityOpen,setActivityOpen]=useState(false)
  const [passwords,setPasswords]=useState({current:'',next:'',confirm:''})
  const [passwordMessage,setPasswordMessage]=useState('')
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
    setPhotoMenu(false)
  }

  const save = () => {
    setSavedSnapshot({whatsapp,emailApproval,photo})
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const discard=()=>{
    setWhatsapp(savedSnapshot.whatsapp)
    setEmailApproval(savedSnapshot.emailApproval)
    setPhoto(savedSnapshot.photo)
    setPhotoMenu(false)
    setSaved(false)
  }

  const updatePassword=()=>{
    if(!passwords.current||!passwords.next||!passwords.confirm){setPasswordMessage('Complete all password fields.');return}
    if(passwords.next.length<8){setPasswordMessage('New password must be at least 8 characters.');return}
    if(passwords.next!==passwords.confirm){setPasswordMessage('New password and confirmation do not match.');return}
    setPasswordMessage('Password updated successfully.')
    setPasswords({current:'',next:'',confirm:''})
  }

  return (
    <Layout
      breadcrumb="Home / Profile"
      title="Profile"
      subtitle="Manage your personal details, communication preferences and account security."
      actions={
        <>
          <button className="btn-secondary" onClick={discard}>Discard</button>
          <button className="btn-primary" onClick={save}>{saved ? 'Saved ✓' : 'Save Changes'}</button>
        </>
      }
    >
      <section className="panel profile-card">
        <div className="panel-head">
          <div>
            <h2>Update Profile</h2>
            <p>Edit your account details and how your profile appears across the system.</p>
          </div>
        </div>

        <div className="profile-main-row">
          <div className="profile-identity">
            <div className="profile-avatar-wrap">
              <button className="profile-avatar" onClick={() => setPhotoMenu(v => !v)} aria-label="Profile photo actions">
                {photo ? <img src={photo} alt="Profile" /> : <span>{currentManager.initials}</span>}
                <span className="avatar-photo-trigger"><Icon name="camera" size={18} /></span>
              </button>

              {photoMenu && (
                <div className="photo-menu">
                  <button onClick={() => { setViewOpen(true); setPhotoMenu(false) }}><Icon name="eye" size={17} />View Photo</button>
                  <button onClick={() => fileRef.current?.click()}><Icon name="camera" size={17} />Change Photo</button>
                  <button className="danger-item" onClick={() => { setPhoto(''); setPhotoMenu(false) }}><Icon name="trash" size={17} />Delete Photo</button>
                </div>
              )}
              <input ref={fileRef} hidden type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} />
            </div>

            <div>
              <h3>{currentManager.name}</h3>
              <p>{currentManager.role} • {currentManager.email}</p>
            </div>
          </div>

          <button className="btn-secondary" onClick={() => fileRef.current?.click()}><Icon name="camera" size={16}/>Change Photo</button>
        </div>

        <div className="profile-settings-row">
          <label className="form-field whatsapp-field">
            <span>WhatsApp</span>
            <div className={`status-select ${whatsapp === 'Linked' ? 'linked' : 'delinked'}`}>
              <Icon name={whatsapp === 'Linked' ? 'link' : 'unlink'} size={17}/>
              <select value={whatsapp} onChange={e => setWhatsapp(e.target.value)}>
                <option value="Linked">Linked</option>
                <option value="De-linked">De-linked</option>
              </select>
              <Icon name="down" size={14}/>
            </div>
          </label>

          <label className="form-field email-pref">
            <span>Email approval notifications</span>
            <button type="button" aria-pressed={emailApproval} className={`switch ${emailApproval ? 'on' : ''}`} onClick={() => setEmailApproval(v => !v)}><i/></button>
          </label>
        </div>
      </section>

      <section className="panel security-card">
        <div className="panel-head">
          <div>
            <h2>Account & Security</h2>
            <p>Password & WhatsApp re-verification are required every 366 days. Reminders begin about 14–30 days before expiry.</p>
          </div>
        </div>
        <button className="security-row" onClick={()=>{setPasswordMessage('');setPasswordOpen(true)}}><Icon name="lock"/><div><strong>Password & sign-in</strong><span>Change password, review sessions and sign-in activity.</span></div><Icon name="chevron"/></button>
        <button className="security-row" onClick={()=>setActivityOpen(true)}><Icon name="clock"/><div><strong>Last login</strong><span>Today • 1:32 PM</span></div><Icon name="chevron"/></button>
      </section>

      <Modal open={viewOpen} title="Profile Photo" onClose={() => setViewOpen(false)} size="sm">
        <div className="photo-preview-large">
          {photo ? <img src={photo} alt="Profile preview" /> : <div className="avatar avatar-xl">{currentManager.initials}</div>}
        </div>
      </Modal>

      <Modal open={passwordOpen} title="Change password" onClose={()=>setPasswordOpen(false)} actions={<><button className="btn-secondary" onClick={()=>setPasswordOpen(false)}>Close</button><button className="btn-primary" onClick={updatePassword}>Update Password</button></>}>
        <div className="stack compact-stack">
          <label className="form-field"><span>Current password</span><input className="control" type="password" value={passwords.current} onChange={e=>setPasswords(v=>({...v,current:e.target.value}))}/></label>
          <label className="form-field"><span>New password</span><input className="control" type="password" value={passwords.next} onChange={e=>setPasswords(v=>({...v,next:e.target.value}))}/></label>
          <label className="form-field"><span>Confirm new password</span><input className="control" type="password" value={passwords.confirm} onChange={e=>setPasswords(v=>({...v,confirm:e.target.value}))}/></label>
          {passwordMessage&&<div className={passwordMessage.includes('success')?'form-success':'form-error'}>{passwordMessage}</div>}
        </div>
      </Modal>

      <Modal open={activityOpen} title="Sign-in activity" onClose={()=>setActivityOpen(false)} size="sm" actions={<button className="btn-secondary" onClick={()=>setActivityOpen(false)}>Done</button>}>
        <div className="activity-list">
          <div><strong>Current session</strong><span>Windows • Chrome • Today 1:32 PM</span><small className="status-text-success">Active</small></div>
          <div><strong>Previous session</strong><span>Windows • Chrome • Yesterday 5:18 PM</span><small>Signed out</small></div>
        </div>
      </Modal>
    </Layout>
  )
}
