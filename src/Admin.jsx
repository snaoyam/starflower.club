import { homeSettings, footerLinks, LINK_ICONS } from './page-settings.mjs';
import LinkIcon from './LinkIcon.jsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createGitHubClient, ADMIN_TARGET } from './admin-github.mjs';
import { createUploadName, coverImagePaths } from './upload-files.mjs';
import { ADMIN_ACCOUNTS_PATH, readAccounts, serializeAccounts, decryptAdmin, addAdmin, removeAdmin, normalizeAdminId, changeAdminPassword } from './admin-auth.mjs';
import { isImage, aboutImagePath, recruitmentImagePath, assertRasterImage, mergedFiles, recordPaths, parseFields, serializeFields, parsePhotoMarkdown, serializePhoto, updateContentField, validateEdits, exhibitionSortNumber } from './admin-model.mjs';
import './admin.css';

const asset = value => new URL(`${import.meta.env.BASE_URL}${value}`, document.baseURI).href;
const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
const titleOf = (files,path) => parseFields(files[path]?.text).제목 || path.split('/').at(-2);
function orderLabel(text) { try { return String(exhibitionSortNumber(parseFields(text))); } catch { return '정렬숫자 확인'; } }
function Field({ label, value = '', onChange, multiline = false, required = false, ...props }) {
  return <label className="admin-field"><span>{label}{required&&<span className="admin-required" aria-hidden="true"> *</span>}</span>{multiline ? <textarea rows={6} value={value} required={required} onChange={e=>onChange(e.target.value)} {...props}/> : <input value={value} required={required} onChange={e=>onChange(e.target.value)} {...props}/>}</label>;
}
function FieldsForm({ path, text, stage, kind }) {
  const [values,setValues] = useState(()=>{
    const info=parseFields(text);
    return {...info,분류:info.분류||(kind==='전시'?'전시':'소식'),...(kind==='전시'?{정렬숫자:info.정렬숫자??String(exhibitionSortNumber(info))}:{})};
  });
  function edit(key,value) { const next={...values,[key]:value};setValues(next);stage(path,{text:serializeFields(next)}); }
  const fields = kind === '전시' ? [['제목','전시 제목'],['정렬숫자','정렬숫자(클수록 최신)','number'],['분류','분류'],['기간','전시 기간'],['장소','장소'],['소개','전시 설명','long'],['링크','링크','url']] : [['제목','뉴스 제목'],['날짜','게시 날짜','date'],['분류','분류'],['내용','본문','long'],['링크','링크','url']];
  return <div className="admin-fields">{fields.map(([key,label,type])=><Field key={key} label={label} value={values[key] ?? ''} type={type==='long'?'text':type || 'text'} multiline={type==='long'} required={['제목','날짜','정렬숫자','분류','내용'].includes(key)} className={key==='내용'?'admin-news-body':undefined} {...(type==='number'?{min:0,max:Number.MAX_SAFE_INTEGER,step:1}:{})} onChange={v=>edit(key,v)}/>)}</div>;
}

function PhotoFields({ path, text, stage }) {
  const [info,setInfo] = useState(()=>parsePhotoMarkdown(text));
  function update(next) { setInfo(next);stage(path,{text:serializePhoto(next)}); }
  return <div className="admin-photo-fields"><Field label="사진 제목" value={info.title} onChange={title=>update({...info,title})}/><Field label="사진 설명" multiline value={info.description} onChange={description=>update({...info,description})}/><div className="admin-meta-heading"><strong>촬영정보·링크</strong><button type="button" onClick={()=>update({...info,hasAdditionalInfo:true,metadata:[...info.metadata,['','']]})}>항목 추가 +</button></div>{info.metadata.map(([label,value],i)=><div className="admin-meta-row" key={i}><input aria-label={`항목 ${i+1} 이름`} placeholder="예: 촬영자" value={label} onChange={e=>update({...info,metadata:info.metadata.map((r,j)=>j===i?[e.target.value,value]:r)})}/><textarea rows={2} aria-label={`항목 ${i+1} 내용`} value={value} onChange={e=>update({...info,metadata:info.metadata.map((r,j)=>j===i?[label,e.target.value]:r)})}/><button type="button" aria-label={`항목 ${i+1} 삭제`} onClick={()=>update({...info,hasAdditionalInfo:true,metadata:info.metadata.filter((_,j)=>j!==i)})}>×</button></div>)}</div>;
}
function RecruitmentEditor({ all, stage, open, setOpen, preview, upload }) {
  const path='content/설정/사이트정보.json';
  const settings=parseFields(all[path]?.text);
  const [url,setURL]=useState(()=>parseFields(all['content/설정/모집링크.json']?.text).url || '');
  function changeURL(value) {setURL(value);stage('content/설정/모집링크.json',{text:updateContentField(all['content/설정/모집링크.json']?.text,'url',open?value:'')});}
  function toggle(value) {setOpen(value);stage('content/설정/모집링크.json',{text:updateContentField(all['content/설정/모집링크.json']?.text,'url',value?url:'')});}
  return <><h2>신입부원 모집</h2><label className="admin-check"><input type="checkbox" checked={open} onChange={e=>toggle(e.target.checked)}/>모집 중으로 표시</label><Field label="모집 링크" type="url" placeholder="https://example.com/apply" value={url} disabled={!open} onChange={changeURL}/>{open && !url && <p className="admin-warning">모집 중으로 표시하려면 모집 링크를 입력해 주세요.</p>}<Field label="모집 안내 문구" multiline value={settings.모집안내 || ''} onChange={value=>stage(path,{text:updateContentField(all[path]?.text,'모집안내',value)})}/><p className="muted">모집을 닫으면 지원서 링크가 숨겨집니다.</p><PagePhotoEditor label="모집 사진" path={recruitmentImagePath(all)} directory="content/모집/" preview={preview} upload={upload}/></>;
}
function PagePhotoEditor({ label, path, directory, preview, upload, fallback }) {
  return <div className="admin-page-photo">
    <h3>{label}</h3>
    {(path || fallback) && <img className="admin-page-photo-preview" src={path ? preview(path) : asset(fallback.thumb || fallback.src)} alt={`${label} 미리보기`}/>}
    <label className="admin-file">{label} 선택<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>{upload(e.target.files,directory,true);e.target.value='';}}/></label>
  </div>;
}
function AboutEditor({ all, stage, preview, upload }) {
  const imagePath=aboutImagePath(all);
  return <>
    <h2>동아리 소개</h2>
    <div className="admin-about-fields"><Field label="소개 글" multiline className="admin-about-body" value={parseFields(all['content/소개.json']?.text).내용 || ''} onChange={value=>stage('content/소개.json',{text:updateContentField(all['content/소개.json']?.text,'내용',value)})}/></div>
    <PagePhotoEditor label="소개 사진" path={imagePath} directory="content/소개/" preview={preview} upload={upload}/>
  </>;
}
export function HomeEditor({ all, stage, preview, upload, home }) {
  const path='content/설정/홈.json';
  const copy=homeSettings(parseFields(all[path]?.text),parseFields(all['content/설정/사이트정보.json']?.text));
  const edit=(key,value)=>stage(path,{text:updateContentField(all[path]?.text,key,value)});
  const fields=(items)=>items.map(([key,label,multiline=false])=><Field key={key} label={label} value={copy[key]} multiline={multiline} rows={3} onChange={value=>edit(key,value)}/>);
  return <><h2>홈 편집</h2><p className="muted">문구의 줄바꿈과 선택한 사진은 저장 및 배포 후 홈에 반영됩니다.</p>
    <section className="admin-home-section"><h3>첫 화면</h3>
      {fields([['대표문구','첫 화면 안내 문구',true]])}
      <PagePhotoEditor label="첫 화면 배경 사진" path={coverImagePaths(all,'content/홈/대표/')[0]} directory="content/홈/대표/" preview={preview} upload={upload} fallback={home?.hero?.image}/>
    </section>
    <section className="admin-home-section"><h3>활동사진 안내</h3>
      {fields([['활동표제','활동사진 상단 문구'],['활동제목','활동사진 제목'],['활동설명','활동사진 안내 문구',true],['활동링크이름','활동사진 버튼 이름'],['활동링크','활동사진 링크 주소']])}
      <PagePhotoEditor label="활동사진 배경" path={coverImagePaths(all,'content/홈/활동/')[0]} directory="content/홈/활동/" preview={preview} upload={upload} fallback={home?.activity?.image}/>
    </section>
    <section className="admin-home-section"><h3>모집 안내 배너</h3>
      {fields([['모집표제','모집 배너 상단 문구'],['모집제목','모집 배너 제목'],['모집설명','모집 배너 안내 문구',true],['모집버튼','모집 안내 버튼 이름']])}
    </section>
  </>;
}
export function FooterEditor({ all, stage }) {
  const path='content/설정/푸터.json';
  const info=parseFields(all[path]?.text);
  const text=info.내용 || '';
  const links=footerLinks(info,parseFields(all['content/설정/사이트정보.json']?.text));
  const changeLinks=next=>stage(path,{text:updateContentField(all[path]?.text,'링크',next)});
  const editLink=(index,key,value)=>changeLinks(links.map((item,i)=>i===index?{...item,[key]:value}:item));
  return <><h2>푸터 편집</h2><p className="muted">모든 페이지의 하단에 표시됩니다. 줄바꿈도 그대로 반영됩니다.</p><Field label="푸터 안내 문구" multiline rows={8} value={text} onChange={value=>stage(path,{text:updateContentField(all[path]?.text,'내용',value)})}/><h3>문구 미리보기</h3><p className="footer-details">{text}</p>
    <div className="admin-editor-title"><h3>푸터 링크</h3><button type="button" onClick={()=>changeLinks([...links,{이름:'',주소:'',아이콘:'link'}])}>링크 추가 +</button></div>
    <p className="muted">표시 이름, 주소, 아이콘을 지정하세요. 웹주소 외에 mailto:이메일, tel:전화번호도 사용할 수 있습니다.</p>
    {!links.length&&<p className="muted">등록된 링크가 없습니다.</p>}
    <div className="admin-footer-links">{links.map((item,i)=><section className="admin-footer-link" key={i} aria-label={`푸터 링크 ${i+1}`}>
      <div className="admin-editor-title"><strong className="admin-link-preview"><LinkIcon type={item.아이콘}/>{item.이름 || `링크 ${i+1}`}</strong><button type="button" className="admin-danger" aria-label={`링크 ${i+1} 삭제`} onClick={()=>changeLinks(links.filter((_,j)=>j!==i))}>삭제</button></div>
      <div className="admin-link-fields"><Field label={`링크 ${i+1} 이름`} value={item.이름} required onChange={value=>editLink(i,'이름',value)}/><Field label={`링크 ${i+1} 주소`} value={item.주소} placeholder="https://example.com" required onChange={value=>editLink(i,'주소',value)}/>
      <label className="admin-field"><span>링크 {i+1} 아이콘</span><select aria-label={`링크 ${i+1} 아이콘`} value={item.아이콘} onChange={e=>editLink(i,'아이콘',e.target.value)}>{LINK_ICONS.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>
    </section>)}</div>
  </>;
}
function Members({ database, currentId, busy, onAdd, onRemove, onEditPassword }) {
  const [username,setUsername]=useState(''),[password,setPassword]=useState('');
  async function submit(e) {
    e.preventDefault();
    const added=await onAdd(username,password);
    setPassword('');if(added)setUsername('');
  }
  return <><h2>관리자 추가</h2><p>변경 후 상단의 저장 및 배포를 눌러 반영하세요.</p><form className="admin-member-form" onSubmit={submit}><Field label="새 관리자 아이디" value={username} onChange={setUsername} autoComplete="off" required/><Field label="새 관리자 비밀번호" type="password" value={password} onChange={setPassword} autoComplete="new-password" required/><button type="submit" disabled={busy||!username.trim()||!password}>관리자 추가</button></form><h2>관리자 목록 · {database.accounts.length}명</h2><div className="admin-members"><table aria-label="관리자 목록"><thead><tr><th scope="col">아이디</th><th scope="col">상태</th><th scope="col">관리</th></tr></thead><tbody>{database.accounts.map(account=><tr className="admin-member" key={account.id}><th scope="row">{account.id}</th><td>{account.id===currentId?<span className="admin-member-status">로그인 중</span>:<span className="muted">—</span>}</td><td><div className="admin-member-actions">{account.id===currentId&&<button type="button" disabled={busy} onClick={onEditPassword}>비밀번호 수정</button>}<button type="button" disabled={busy||database.accounts.length<=1} onClick={()=>{if(window.confirm(`${account.id} 관리자를 삭제할까요? 저장 및 배포 후 반영됩니다.`))onRemove(account.id);}}>삭제</button></div></td></tr>)}</tbody></table></div></>;
}

function OwnAccount({ currentId, busy, onChangePassword, onBack }) {
  const heading=useRef(null);
  useEffect(()=>{heading.current?.focus();},[]);
  const [current,setCurrent]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[error,setError]=useState('');
  async function submit(e) {
    e.preventDefault();setError('');
    if(password!==confirmation){setError('새 비밀번호와 확인이 일치하지 않습니다.');return;}
    await onChangePassword(current,password,confirmation);
    setCurrent('');setPassword('');setConfirmation('');
  }
  return <><div className="admin-editor-title"><h2 ref={heading} tabIndex={-1}>비밀번호 수정</h2><button type="button" disabled={busy} onClick={onBack}>관리자 목록으로</button></div><p>로그인 아이디: <strong>{currentId}</strong></p><p>현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다. 변경 후 상단의 저장 및 배포를 눌러 반영하세요.</p><form className="admin-member-form" onSubmit={submit}><Field label="현재 비밀번호" type="password" value={current} onChange={setCurrent} autoComplete="off" required/><Field label="새 비밀번호" type="password" value={password} onChange={setPassword} autoComplete="off" required/><Field label="새 비밀번호 확인" type="password" value={confirmation} onChange={setConfirmation} autoComplete="off" required/><button type="submit" disabled={busy||!current||!password||!confirmation}>비밀번호 변경</button>{error&&<p className="admin-error" role="alert">{error}</p>}</form></>;
}
function Login({ busy, error, onLogin }) {
  const [id,setId]=useState(''),[password,setPassword]=useState('');
  async function submit(e){e.preventDefault();const result=await onLogin(id,password);setPassword('');if(result)setId('');}
  return <div className="wrap page admin-page"><div className="admin-login"><span className="eyebrow">STARFLOWER ADMIN</span><h1>관리자 로그인</h1><p>관리자 아이디와 비밀번호를 입력하세요.</p><form onSubmit={submit}><Field label="아이디" value={id} onChange={setId} autoComplete="username" required disabled={busy}/><Field label="비밀번호" type="password" value={password} onChange={setPassword} autoComplete="off" required disabled={busy}/><button type="submit" className="primary admin-login-submit" disabled={busy}>{busy?'로그인 중…':'로그인'}</button></form>{error&&<p role="alert" className="admin-error">{error}</p>}</div></div>;
}

function Review({ changes, snapshot, busy, close, save }) {
  const dialog=useRef(null);
  useEffect(()=>{const previous=document.activeElement;dialog.current.showModal();return()=>{dialog.current?.close();previous?.focus();};},[]);
  return <dialog ref={dialog} className="admin-review admin-page" aria-labelledby="admin-review-title" onCancel={e=>{e.preventDefault();if(!busy)close();}}><h2 id="admin-review-title">변경사항 저장</h2><p>지금까지 수정사항을 저장하고 배포하시겠습니까?</p><ul>{Object.entries(changes).map(([p,v])=><li key={p}><span>{v===null?'삭제':snapshot.files[p]?'수정':'추가'}</span> {p===ADMIN_ACCOUNTS_PATH?'사이트 관리자':p==='content/설정/푸터.json'?'푸터 문구·링크':p==='content/설정/홈.json'?'홈 문구':p.startsWith('content/홈/')?'홈 배경 사진':p==='content/소개.json'?'동아리 소개 글':p.startsWith('content/소개/')?'동아리 소개 사진':p.startsWith('content/모집/')?'신입부원 모집 사진':p.replace('content/','')}</li>)}</ul><div className="admin-actions"><button disabled={busy} onClick={close}>취소</button><button className="primary" disabled={busy} onClick={save}>배포하기</button></div></dialog>;
}

export default function Admin({ home }) {
  const credentials=useRef(null), urls=useRef(new Set()), active=useRef(true);
  const [session,setSession]=useState(null),[snapshot,setSnapshot]=useState(null),[changes,setChanges]=useState({}),[tab,setTab]=useState('전시'),[selected,setSelected]=useState(''),[status,setStatus]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[review,setReview]=useState(false),[dispatchPending,setDispatchPending]=useState(false),[recruitOpen,setRecruitOpen]=useState(false),[accountView,setAccountView]=useState(false);
  const count=Object.keys(changes).length;
  const all=useMemo(()=>mergedFiles(snapshot?.files || {},changes),[snapshot,changes]);
  useEffect(()=>{ active.current=true;return()=>{active.current=false;credentials.current=null;for(const url of urls.current)URL.revokeObjectURL(url);};},[]);
  useEffect(()=>{function warn(e){if(count||dispatchPending||busy){e.preventDefault();e.returnValue='';}}window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[count,dispatchPending,busy]);
  useEffect(()=>{
    function guard(e) {
      const link=e.target.closest('a[href]');
      if(!link||!link.getAttribute('href')?.startsWith('#/')||link.getAttribute('href')==='#/admin'||!(count||dispatchPending||busy))return;
      if(busy){e.preventDefault();e.stopPropagation();setError('저장 요청이 끝난 뒤 이동해 주세요.');}
      else if(!window.confirm('저장하지 않은 편집 내용 또는 배포 대기 상태가 있습니다. 관리 화면을 나갈까요?')){e.preventDefault();e.stopPropagation();}
    }
    document.addEventListener('click',guard,true);return()=>document.removeEventListener('click',guard,true);
  },[count,dispatchPending,busy]);
  async function run(task) {setBusy(true);setError('');try{return await task();}catch(e){if(active.current)setError(e.message);}finally{if(active.current)setBusy(false);}}
  function stage(path,value) {setStatus('');setReview(false);setChanges(previous=>{const next={...previous};if(value?.text!==undefined && value.text===snapshot?.files[path]?.text)delete next[path];else if(value===null&&!snapshot?.files[path])delete next[path];else next[path]=value;return next;});}
  async function login(id,password) {
    return run(async()=>{
      const response=await fetch(asset('data/admin.json'),{cache:'no-store'});
      if(!response.ok)throw Error('편집용 자료를 불러오지 못했습니다. 사이트를 다시 배포해 주세요.');
      const data=await response.json();
      if(data.version!==1||!data.files)throw Error('편집용 자료 형식을 확인해 주세요.');
      const accountText=data.files[ADMIN_ACCOUNTS_PATH]?.text;
      if(!accountText)throw Error('관리자 계정 설정을 찾을 수 없습니다. 최신 버전을 배포해 주세요.');
      const token=await decryptAdmin(readAccounts(accountText),id,password);
      if(!active.current)return false;
      credentials.current={...ADMIN_TARGET,token};
      setRecruitOpen(!!parseFields(data.files['content/설정/모집링크.json']?.text).url?.trim());setSnapshot(data);setSession({...ADMIN_TARGET,userId:normalizeAdminId(id)});setStatus('');
      return true;
    });
  }
  async function addMember(id,password) {
    return run(async()=>{
      const database=readAccounts(all[ADMIN_ACCOUNTS_PATH].text);
      const next=await addAdmin(database,id,password,credentials.current.token);
      stage(ADMIN_ACCOUNTS_PATH,{text:serializeAccounts(next)});return true;
    });
  }
  function removeMember(id) {
    setError('');
    try {const text=serializeAccounts(removeAdmin(readAccounts(all[ADMIN_ACCOUNTS_PATH].text),id));stage(ADMIN_ACCOUNTS_PATH,{text});setStatus(text===snapshot.files[ADMIN_ACCOUNTS_PATH].text?'관리자 목록을 원래 상태로 되돌렸습니다.':'관리자를 삭제 목록에 반영했습니다. 저장 및 배포를 눌러 주세요.');}
    catch(e){setError(e.message);}
  }
  async function changePassword(currentPassword,newPassword,confirmation) {
    return run(async()=>{
      const next=await changeAdminPassword(readAccounts(all[ADMIN_ACCOUNTS_PATH].text),session.userId,currentPassword,newPassword,confirmation,{authenticationDatabase:readAccounts(snapshot.files[ADMIN_ACCOUNTS_PATH].text)});
      if(!active.current)return false;
      stage(ADMIN_ACCOUNTS_PATH,{text:serializeAccounts(next)});setStatus('비밀번호 변경을 준비했습니다. 저장 및 배포가 완료된 뒤 새 비밀번호로 로그인하세요.');return true;
    });
  }
  function logout() {
    if((count||dispatchPending)&&!window.confirm('저장하지 않은 변경사항 또는 배포 대기 상태가 있습니다. 로그아웃할까요?'))return;
    credentials.current=null;for(const url of urls.current)URL.revokeObjectURL(url);urls.current.clear();setSession(null);setSnapshot(null);setChanges({});setSelected('');setStatus('');setError('');setReview(false);setDispatchPending(false);setAccountView(false);
  }
  function addRecord() {
    const id=`${today()}-${crypto.randomUUID().slice(0,8)}`;
    const path=`content/${tab}/${id}/${tab==='전시'?'전시정보':'소식'}.json`;
    stage(path,{text:serializeFields(tab==='전시'?{제목:'새 전시',날짜:today(),정렬숫자:today().replaceAll('-',''),분류:'전시',기간:'',장소:'온라인',소개:''}:{제목:'새 소식',날짜:today(),분류:'소식',내용:''})});setSelected(path);
  }
  function removeRecord(path) {
    if(!window.confirm(`“${titleOf(all,path)}”와 포함된 사진을 삭제할까요? 저장 전에는 되돌릴 수 있습니다.`))return;
    const prefix=path.slice(0,path.lastIndexOf('/')+1);
    for(const p of Object.keys(all))if(p.startsWith(prefix))stage(p,null);
    setSelected('');
  }
  async function upload(fileList,prefix,cover=false) {
    const selectedAt=Date.now();
    const files=Array.from(fileList||[]);if(!files.length)return;
    await run(async()=>{
      const pendingBytes=Object.values(changes).reduce((sum,value)=>sum+(value?.base64?.length||0)*.75,0);
      if(files.length>100||files.reduce((sum,file)=>sum+file.size,0)+pendingBytes>50*1024*1024)throw Error('사진은 한 번에 100장 이하, 저장 대기 중인 사진과 합계 50MB 이하로 선택해 주세요.');
      const prepared=[];
      const existingNames=new Set(Object.keys(all).map(path=>path.split('/').at(-1)));
      const lastOrder=Math.max(0,...Object.keys(all).filter(path=>path.startsWith(prefix)&&isImage(path)).map(path=>Number(path.slice(prefix.length).match(/^\d+/)?.[0]||0)));
      for(const [i,file] of files.entries()) {
        const ext=file.name.split('.').at(-1).toLowerCase();
        if(!['jpg','jpeg','png','webp','avif'].includes(ext)||file.size>10*1024*1024)throw Error('사진은 JPG·PNG·WebP·AVIF, 한 장당 10MB 이하로 선택해 주세요.');
        const bytes=new Uint8Array(await file.arrayBuffer());assertRasterImage(bytes);
        const preview=URL.createObjectURL(file);urls.current.add(preview);
        try { await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(Error('읽을 수 없는 사진입니다.'));img.src=preview;}); }
        catch(e){URL.revokeObjectURL(preview);urls.current.delete(preview);throw e;}
        let binary='';for(let j=0;j<bytes.length;j+=0x8000)binary+=String.fromCharCode(...bytes.subarray(j,j+0x8000));
        const name=await createUploadName(file.name,{selectedAt,cover,order:lastOrder+i+1,existingNames});
        prepared.push([prefix+name,{base64:btoa(binary),preview},file.name.replace(/\.[^.]+$/,'')]);
      }
      if(cover)for(const path of coverImagePaths(all,prefix))stage(path,null);
      for(const [path,value,title]of prepared){stage(path,value);if(!cover)stage(path.replace(/\.[^.]+$/,'.md'),{text:serializePhoto({title,description:'',category:'',metadata:[],hasAdditionalInfo:false})});}
    });
  }
  function prepareSave(){setError('');try{validateEdits(snapshot.files,changes);const r=parseFields(all['content/설정/모집링크.json']?.text).url?.trim();if(recruitOpen&&!r)throw Error('모집 중으로 표시하려면 지원서 주소를 입력해 주세요.');setReview(true);}catch(e){setError(e.message);}}
  function deploymentRequested(message,files=snapshot.files) {
    setDispatchPending(false);
    if(!readAccounts(files[ADMIN_ACCOUNTS_PATH].text).accounts.some(account=>account.id===session.userId)){
      credentials.current=null;setSession(null);setSnapshot(null);setChanges({});setSelected('');setTab('전시');setStatus('');
    } else setStatus(message);
  }
  async function save() {
    setReview(false);
    await run(async()=>{
      validateEdits(snapshot.files,changes);
      const client=createGitHubClient(credentials.current);
      const result=await client.publish(snapshot.files,changes,message=>{if(active.current)setStatus(message);});
      if(!active.current)return;
      setSnapshot({version:1,files:result.files});setChanges({});setReview(false);setDispatchPending(true);setStatus('변경사항이 저장소에 저장되었습니다. 배포를 요청하고 있습니다…');
      try {await client.dispatch();if(active.current){deploymentRequested('저장 완료 · GitHub Actions에 배포를 요청했습니다. 배포가 완료되면 사이트에 반영됩니다.',result.files);}}
      catch(e){throw Error(`저장소 저장은 완료됐지만 배포 요청에 실패했습니다. ‘배포 다시 요청’을 눌러 주세요. ${e.message}`);}
    });
  }
  const client=session&&credentials.current?createGitHubClient(credentials.current):null;
  const paths=tab==='전시'||tab==='소식'?recordPaths(all,tab):[];
  const path=paths.includes(selected)?selected:'';
  const prefix=path?path.slice(0,path.lastIndexOf('/')+1):'';
  const photoPrefix=prefix+(tab==='전시'?'작품/':'사진/');
  const photos=path?Object.keys(all).filter(p=>p.startsWith(photoPrefix)&&isImage(p)).sort((a,b)=>a.localeCompare(b,'ko',{numeric:true})):[];
  const cover=path?coverImagePaths(all,prefix)[0]:null;
  const preview=p=>all[p]?.preview?.startsWith('blob:')?all[p].preview:all[p]?.preview?asset(all[p].preview):'';
  if(!session)return <Login busy={busy} error={error} onLogin={login}/>;
  return <div className="wrap page admin-page"><header className="admin-header"><div><span className="eyebrow">STARFLOWER ADMIN</span><h1>사이트 관리</h1></div><div className="admin-actions"><button disabled={busy} onClick={logout}>로그아웃</button><button className="primary" disabled={busy||!count||dispatchPending} onClick={prepareSave}>저장 및 배포{count?` (${count})`:''}</button></div></header><div className="admin-feedback" aria-live="polite">{status&&<p role="status">{status} {status.includes('완료')&&<a href={client.actionsURL} target="_blank" rel="noreferrer">배포 상태 보기 ↗</a>}</p>}{error&&<p className="admin-error" role="alert">{error}</p>}{dispatchPending&&<button disabled={busy} onClick={()=>run(async()=>{await client.dispatch();deploymentRequested('GitHub Actions에 배포를 다시 요청했습니다. 배포 상태를 확인해 주세요.');})}>배포 다시 요청</button>}</div><nav className="admin-tabs" aria-label="관리 항목">{[['홈','홈 편집'],['소개','동아리 소개'],['전시','전시'],['모집','신입부원 모집'],['소식','소식'],['푸터','푸터 편집'],['사용자','관리자 관리']].map(([key,label])=><button key={key} aria-current={tab===key?'page':undefined} disabled={busy} onClick={()=>{setTab(key);setSelected('');setAccountView(false);}}>{label}</button>)}</nav>
    <fieldset className="admin-workspace" disabled={busy||dispatchPending}>
    {(tab==='전시'||tab==='소식')&&<div className="admin-columns"><aside className="admin-list"><button className="admin-add" onClick={addRecord}>{tab==='전시'?'전시':'뉴스'} 추가 +</button>{paths.map(p=><button key={p} className={path===p?'selected':''} onClick={()=>setSelected(p)}><strong>{titleOf(all,p)}</strong><small>{tab==='전시'?orderLabel(all[p].text):parseFields(all[p].text).날짜 || '날짜 없음'}{changes[p]?' · 편집 중':''}</small></button>)}</aside><section className="admin-editor">{path?<><div className="admin-editor-title"><h2>{tab==='전시'?'전시 편집':'뉴스 편집'}</h2><button className="admin-danger" onClick={()=>removeRecord(path)}>삭제</button></div><FieldsForm key={path} path={path} text={all[path].text} stage={stage} kind={tab}/><h3>커버·포스터</h3>{cover&&<div className="admin-cover"><img src={preview(cover)} alt="커버 미리보기"/><button onClick={()=>stage(cover,null)}>커버 삭제</button></div>}<label className="admin-file">커버 사진 선택<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>{upload(e.target.files,prefix,true);e.target.value='';}}/></label><div className="admin-editor-title"><h3>{tab==='전시'?'전시 작품':'뉴스 사진'} <small>{photos.length}장</small></h3><label className="admin-file">사진 추가 +<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>{upload(e.target.files,photoPrefix);e.target.value='';}}/></label></div>{photos.map(p=>{const md=p.replace(/\.[^.]+$/,'.md');return <details className="admin-photo" key={p}><summary><img src={preview(p)} alt=""/><span>{parsePhotoMarkdown(all[md]?.text||'').title||p.split('/').at(-1)}</span></summary><PhotoFields path={md} text={all[md]?.text||''} stage={stage}/><button className="admin-danger" onClick={()=>{if(window.confirm('이 사진과 설명을 삭제할까요?')){stage(p,null);if(all[md])stage(md,null);}}}>사진 삭제</button></details>;})}</>:<div className="admin-empty"><span>✦</span><h2>편집할 {tab==='전시'?'전시':'뉴스'}를 선택하세요</h2><p>새 항목을 추가하거나 왼쪽 목록에서 선택할 수 있습니다.</p></div>}</section></div>}
    {tab==='홈'&&<section className="admin-panel"><HomeEditor all={all} stage={stage} preview={preview} upload={upload} home={home}/></section>}
    {tab==='소개'&&<section className="admin-panel"><AboutEditor all={all} stage={stage} preview={preview} upload={upload}/></section>}
    {tab==='푸터'&&<section className="admin-panel"><FooterEditor all={all} stage={stage}/></section>}
    {tab==='모집'&&<section className="admin-panel"><RecruitmentEditor all={all} stage={stage} open={recruitOpen} setOpen={setRecruitOpen} preview={preview} upload={upload}/></section>}
    {tab==='사용자'&&!accountView&&<section className="admin-panel"><Members database={readAccounts(all[ADMIN_ACCOUNTS_PATH].text)} currentId={session.userId} busy={busy} onAdd={addMember} onRemove={removeMember} onEditPassword={()=>setAccountView(true)}/></section>}
    {tab==='사용자'&&accountView&&<section className="admin-panel"><OwnAccount currentId={session.userId} busy={busy} onChangePassword={changePassword} onBack={()=>setAccountView(false)}/></section>}
    </fieldset>
    {count>0&&<div className="admin-bottom"><span>저장하지 않은 파일 {count}개</span><button disabled={busy||dispatchPending} onClick={()=>{if(window.confirm('이 탭의 편집 내용을 모두 되돌릴까요?')){setChanges({});setRecruitOpen(!!parseFields(snapshot.files['content/설정/모집링크.json']?.text).url?.trim());setSelected('');setReview(false);setTab('전시');setAccountView(false);}}}>변경사항 되돌리기</button></div>}
    {review&&<Review changes={changes} snapshot={snapshot} busy={busy} close={()=>setReview(false)} save={save}/>}
  </div>;
}
