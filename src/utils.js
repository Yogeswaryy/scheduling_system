export function downloadCsv(filename, rows){
  if(!rows?.length) return
  const keys=Object.keys(rows[0])
  const esc=(value)=>`"${String(value??'').replaceAll('"','""')}"`
  const csv=[keys.map(esc).join(','),...rows.map(row=>keys.map(k=>esc(row[k])).join(','))].join('\n')
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)
}
