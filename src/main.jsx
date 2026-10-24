import { homeSettings, footerLinks, linkURL } from './page-settings.mjs';
import LinkIcon from './LinkIcon.jsx';
import React, { Suspense, lazy, useEffect, useRef, useState, useTransition } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { markdownLinks } from './markdown-links.mjs';
import { createImagePreloader, createPhotoNavigation } from './lightbox-navigation.mjs';
import { createSiteDataLoader, prefetchSiteDetail } from './site-data.mjs';

const preloadPhoto = createImagePreloader();
const Admin = lazy(() => import('./Admin.jsx'));

const asset = value => new URL(`${import.meta.env.BASE_URL}${value}`, document.baseURI).href;
const loadSiteData = createSiteDataLoader({ resolve: asset });
const routeFor = (kind, id) => `#/${kind}/${encodeURIComponent(id)}`;
const instagramURL = settings => /^https:\/\//.test(settings.인스타그램 || '') ? settings.인스타그램 : 'https://www.instagram.com/kaist_starflower/';
const displayDate = value => value ? value.replaceAll('-', '.') : '';
const paragraphs = text => (text || '').split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>);
function Arrow({ diagonal = false, className = '' }) { return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>; }
function InstagramIcon() { return <svg className="instagram-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>; }
function SocialIcon({ type }) {
 const paths = {email:<><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7"/></>,facebook:<path d="M14 21v-8h3l.5-4H14V7c0-1 .4-2 2-2h2V1.5c-.8-.1-1.8-.2-3-.2-3.1 0-5 1.9-5 5.3V9H7v4h3v8Z" fill="currentColor"/>,youtube:<><rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.7"/><path d="m10 9 6 3-6 3Z" fill="currentColor"/></>};
 return <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">{paths[type]}</svg>;
}
function Star({ className = '' }) { return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m32 3 5.5 22.5L61 32l-23.5 6.5L32 61l-5.5-22.5L3 32l23.5-6.5Z" fill="currentColor"/><ellipse cx="32" cy="32" rx="28" ry="12" stroke="currentColor" transform="rotate(-35 32 32)"/></svg>; }
function Brand({ settings }) { return <a className="brand" href="#/" aria-label={`${settings.이름 || '별바라기'} 홈`}><img src={asset('brand/starflower-logo.png')} alt={settings.영문이름 || 'STARFLOWER'} width="468" height="206"/><small>KAIST 천체관측 동아리</small></a>; }
function Photo({ image, alt, full = false, className = '', eager = false, ...props }) { return image ? <img className={className} src={asset(full ? image.src : image.thumb)} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" {...props}/> : <div className={`photo-placeholder ${className}`}><Star/><span>STARFLOWER</span></div>; }
function ActivityPhoto({ image }) {
  return <Photo image={image} full className="activity-photo" width={image?.width} height={image?.height} alt="별바라기 소개 사진"/>;
}
function TextLink({ to, children }) { return <a href={to} className="text-link">{children}<Arrow/></a>; }
function InstagramLink({ settings }) { return <a className="text-link instagram-link" href={instagramURL(settings)} target="_blank" rel="noreferrer"><InstagramIcon/><span>Instagram</span><Arrow diagonal/></a>; }
function PageHeader({ eyebrow, title, description, children }) { return <header className="page-header">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<div className="page-title-row"><h1>{title}</h1>{children}</div>{description && <p>{description}</p>}</header>; }
function InlineLinks({ text }) { return markdownLinks(text).map((part, i) => part.href ? <a key={i} href={part.href} target="_blank" rel="noreferrer">{part.text}</a> : <React.Fragment key={i}>{part.text}</React.Fragment>); }
function PhotoInfo({ rows = [] }) { return rows.length ? <section className="photo-details"><table className="photo-info-table" aria-label="추가정보"><tbody>{rows.map(([label,value], i)=><tr key={i}>{label ? <><th scope="row"><InlineLinks text={label}/></th><td><InlineLinks text={value}/></td></> : <td colSpan={2}><InlineLinks text={value}/></td>}</tr>)}</tbody></table></section> : null; }
function Empty({ title, children, link = '#/exhibitions', label = '지난 전시 둘러보기' }) { return <div className="empty"><Star/><h2>{title}</h2><p>{children}</p>{link && <TextLink to={link}>{label}</TextLink>}</div>; }
function DetailLink({ record, kind, children, ...props }) {
 const prepare=()=>prefetchSiteDetail(loadSiteData,record,navigator.connection);
 return <a {...props} href={routeFor(kind,record.id)} onPointerEnter={prepare} onFocus={prepare} onTouchStart={prepare}>{children}</a>;
}
function ExhibitionCard({ exhibition }) { return <DetailLink record={exhibition} kind="exhibitions" className="exhibition-card"><div className="card-image"><Photo image={exhibition.cover} alt={`${exhibition.title} 전시 커버`}/><span className="tag image-tag">{exhibition.category || '전시'}</span></div><div className="card-meta"><span>{exhibition.period || exhibition.date.slice(0, 4)}</span></div><h3>{exhibition.title}</h3></DetailLink>; }
function NewsRows({ items }) { return <div className="news-rows">{items.map(item => <DetailLink className="news-row" record={item} kind="news" key={item.id}><span className="tag">{item.category}</span><h3>{item.title}</h3><time>{displayDate(item.date)}</time><Arrow/></DetailLink>)}</div>; }
function Navigation({ route, data }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [route]);
  useEffect(() => { function escape(e) { if(e.key === 'Escape') setOpen(false); } document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, []);
  const links = [['/', '홈'], ['/about', '동아리 소개'], ['/exhibitions', '천체사진 전시'], ['/recruitment', '신입부원 모집'], ['/news', '소식']];
  return <header className="site-header"><Brand settings={data.settings}/><button className="menu-toggle" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 6h16M4 12h16M4 18h16'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></button><nav id="primary-nav" className={open ? 'is-open' : ''} aria-label="주요 메뉴" onClick={e=>{if(e.target.closest('a'))setOpen(false);}}>{links.map(([path, label]) => <a key={path} href={`#${path}`} className={route === path || (path !== '/' && route.startsWith(path + '/')) ? 'active' : ''} aria-current={route === path ? 'page' : undefined}>{label}</a>)}</nav></header>;
}
function Home({ data }) {
  const latest = data.exhibitions[0];
  const heroArt = data.home.hero;
  const activityArt = data.home.activity;
  const copy = homeSettings(data.home.copy, data.settings);
  return <>
    <section className="hero" style={{'--hero-image': heroArt?.image || latest?.cover ? `url("${asset((heroArt?.image || latest.cover).src)}")` : 'none'}}>
      <div className="hero-photo"><Photo image={heroArt?.image || latest?.cover} full eager alt={heroArt?.title || '별바라기 부원이 촬영한 천체사진'}/></div>
      <div className="hero-orbit" aria-hidden="true"/>
      <div className="hero-content"><span className="eyebrow"><span className="tiny-star">✦</span> KAIST ASTRONOMY CLUB · SINCE {data.settings.창립연도 || '1987'}</span><h1><span className="hero-club-name">KAIST 천체관측 동아리</span><br/><em>별바라기</em></h1><p className="home-copy">{copy.대표문구}</p><div className="hero-actions"><a className="button primary" href="#/exhibitions">천체사진·전시 보기<Arrow/></a><a className="button outline" href="#/about">별바라기 알아보기<Arrow diagonal/></a></div></div>
      <div className="hero-bottom"><span>KAIST STARFLOWER</span>{heroArt && <span className="hero-credit">{heroArt.title}</span>}</div>
    </section>
    <section className="wrap section"><div className="section-heading"><div><span className="eyebrow">EXHIBITION ARCHIVE</span><h2>천체사진과 전시</h2></div><TextLink to="#/exhibitions">전시 전체보기</TextLink></div><div className="exhibition-grid">{data.exhibitions.slice(0, 3).map(e => <ExhibitionCard key={e.id} exhibition={e}/>)}</div>{!data.exhibitions.length && <Empty title="등록된 전시가 없습니다." link={null}>지난 전시와 천체사진을 이곳에서 소개합니다.</Empty>}</section>
    <section className="activity-band wrap"><div className="activity-backdrop" aria-hidden="true"><Photo image={activityArt?.image || latest?.cover} full alt=""/></div><div className="activity-copy"><span className="eyebrow">{copy.활동표제}</span><h2>{copy.활동제목}</h2><p className="home-copy">{copy.활동설명}</p>{copy.활동링크 && <a className="text-link instagram-link" href={linkURL(copy.활동링크,{webOnly:true})} target="_blank" rel="noreferrer"><LinkIcon type={copy.활동링크아이콘}/><span>{copy.활동링크이름}</span><Arrow diagonal/></a>}</div></section>
    <section className="wrap section"><div className="section-heading"><div><span className="eyebrow">NEWS & EVENTS</span><h2>별바라기의 소식</h2></div><TextLink to="#/news">소식 전체보기</TextLink></div>{data.news.length ? <NewsRows items={data.news.slice(0, 3)}/> : <p className="muted">등록된 소식이 없습니다.</p>}</section>
    <section className="join-banner wrap"><div><span className="eyebrow">{copy.모집표제}</span><h2>{copy.모집제목}</h2><p className="home-copy">{copy.모집설명}</p></div><a className="button primary" href="#/recruitment">{copy.모집버튼}<Arrow diagonal/></a></section>
  </>;
}
function About({ data }) {
 return <div className="wrap page">
  <span className="eyebrow">ABOUT STARFLOWER</span>
  <div className="about-layout">
   <div className="about-copy"><PageHeader title="동아리 소개"/><div className="prose">{paragraphs(data.introduction)}</div><div className="about-links"><a className="button outline about-apply" href="#/recruitment">신입부원 지원하기<Arrow/></a></div></div>
   <figure className="about-photo"><ActivityPhoto image={data.introductionImage}/></figure>
  </div>
 </div>;
}
function Exhibitions({ data }) {
 return <div className="wrap page"><PageHeader eyebrow="EXHIBITIONS" title="전시·천체사진"/><div className="exhibition-grid">{data.exhibitions.map(e=><ExhibitionCard key={e.id} exhibition={e}/>)}</div>{!data.exhibitions.length && <Empty title="등록된 전시가 없습니다." link={null}>지난 전시와 천체사진을 이곳에서 소개합니다.</Empty>}</div>;
}
function Gallery({ items, onOpen, showCaptions = true }) { return <div className="photo-grid">{items.map((item, i)=><button className="photo-card" onClick={()=>onOpen(items,i)} key={item.id} aria-label={`${item.title} 크게 보기`}><div className={`photo-card-image${item.trimFooter ? ' trim-footer' : ''}`}><Photo image={item.image} alt={item.title}/></div>{showCaptions && <div className="photo-card-caption"><div><h3>{item.title}</h3></div><span>{String(i+1).padStart(2,'0')}</span></div>}</button>)}</div>; }
function DelayedNotice({ active = true }) {
 const [visible,setVisible]=useState(false);
 useEffect(()=>{setVisible(false);if(!active)return;const timer=setTimeout(()=>setVisible(true),250);return()=>clearTimeout(timer);},[active]);
 return active && visible ? <div className="route-progress" role="status">내용을 불러오는 중입니다.</div> : null;
}
function RoutePlaceholder({ route, data }) {
 const kind=route.startsWith('/news/')?'news':'exhibitions';
 const record=data[kind].find(item=>route===`/${kind}/${item.id}`);
 return <div className="wrap page" aria-busy="true">{record && <><a className="back-link" href={`#/${kind}`}>← {kind==='news'?'소식 목록':'천체사진 전시'}</a><PageHeader title={record.title}/></>}<DelayedNotice/></div>;
}
function DetailContent({ record, kind, children }) {
 const [,setAttempt]=useState(0);
 const [,retryTransition]=useTransition();
 const state=loadSiteData.read(record.detailPath);
 if(state.data) return children(state.data);
 const retry=()=>{loadSiteData.retry(record.detailPath).catch(()=>{});retryTransition(()=>setAttempt(n=>n+1));};
 return <div className="wrap page"><a className="back-link" href={`#/${kind}`}>← {kind==='news'?'소식 목록':'천체사진 전시'}</a><div className="empty"><Star/><h1>{record.title}</h1><p role="alert">내용을 불러오지 못했습니다. 다시 시도해 주세요.</p><button className="button outline" onClick={retry}>다시 시도</button></div></div>;
}
function ExhibitionDetail({ id, data, onOpen }) {
 const exhibition = data.exhibitions.find(e=>e.id===id);
 if(!exhibition) return <div className="wrap page"><Empty title="전시를 찾을 수 없습니다.">전시가 이동되었거나 공개가 종료되었을 수 있습니다.</Empty></div>;
 return <DetailContent key={exhibition.detailPath} record={exhibition} kind="exhibitions">{item=><ExhibitionArticle exhibition={item} onOpen={onOpen}/>}</DetailContent>;
}
function ExhibitionArticle({ exhibition, onOpen }) {
 const period = (exhibition.period || '').trim();
 const location = (exhibition.location || '').trim();
 const hasArtworks = exhibition.artworks.length > 0;
 const description = <div className="exhibition-description">{paragraphs(exhibition.description)}<PhotoInfo rows={exhibition.source ? [['링크', `[${exhibition.source}](${exhibition.source})`]] : []}/></div>;
 return <div className="wrap page">
  <a className="back-link" href="#/exhibitions">← 천체사진 전시</a>
  <header className={`exhibition-detail-header${!hasArtworks ? ' poster-exhibition-header' : ''}`}>
   <div>
    <h1>{exhibition.title}</h1>
    {!hasArtworks ? <>
     {(period || location) && <dl className="exhibition-facts">
      {period && <div><dt>기간</dt><dd>{period}</dd></div>}
      {location && <div><dt>장소</dt><dd>{location}</dd></div>}
     </dl>}
     {description}
    </> : (period || location) && <p className="exhibition-meta">{period && <span className="exhibition-meta-item">{period}</span>}{location && <span className="exhibition-meta-item">{period && <span className="dot-separator" aria-hidden="true">·</span>}<span>{location}</span></span>}</p>}
   </div>
   {!hasArtworks ? <figure className="exhibition-poster"><Photo image={exhibition.cover} full eager alt={`${exhibition.title} 전시 포스터`}/></figure> : description}
  </header>
  {hasArtworks && <>
   <div className="gallery-heading"><span>{exhibition.artworks.length} WORKS</span><span>사진을 누르면 설명과 촬영정보를 볼 수 있습니다 <Arrow diagonal/></span></div>
   <Gallery items={exhibition.artworks} onOpen={onOpen}/>
  </>}
 </div>;
}
function Recruitment({ data }) { return <div className="wrap page"><div className="recruit-hero"><div className="recruit-photo"><Photo image={data.recruitmentImage} full eager alt="별바라기 신입부원 모집 사진"/></div><div className="recruit-copy"><span className="eyebrow">RECRUITMENT</span><h1>신입부원 모집</h1><p>{data.settings.모집안내}</p>{data.recruitmentUrl && <><a className="button primary" href={data.recruitmentUrl} target="_blank" rel="noreferrer">신입부원 지원하기<Arrow diagonal/></a></>}</div></div><section className="faq-section"><div><span className="eyebrow">FAQ</span><h2>자주 묻는 질문</h2><p>지원과 동아리 활동에 관한 안내입니다.</p></div><div className="faq-list">{data.faqs.map((faq,i)=><details key={i}><summary><span className="faq-number">{String(i+1).padStart(2,'0')}</span><span>{faq.question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><div className="faq-answer">{paragraphs(faq.answer)}</div></details>)}</div></section></div>; }
function NewsDetail({ data, id, onOpen }) {
 const item=data.news.find(n=>n.id===id);
 if(!item) return <div className="wrap page"><Empty title="소식을 찾을 수 없습니다." link="#/news" label="소식 목록으로">삭제되었거나 이동한 소식입니다.</Empty></div>;
 return <DetailContent key={item.detailPath} record={item} kind="news">{record=><NewsArticle item={record} onOpen={onOpen}/>}</DetailContent>;
}
function NewsArticle({ item, onOpen }) {
 return <article className="wrap page article"><a href="#/news" className="back-link">← 소식 목록</a><header><div className="article-meta"><span className="tag">{item.category}</span><time>{displayDate(item.date)}</time></div><h1>{item.title}</h1></header>{item.cover && !item.photos?.length && <Photo className="article-cover" image={item.cover} full alt={`${item.title} 포스터`}/>}<div className="prose article-body">{paragraphs(item.body)}<PhotoInfo rows={item.metadata}/></div>{!!item.photos?.length && <section className="article-gallery"><div className="gallery-heading"><span>{item.photos.length} PHOTOS</span><span>사진을 누르면 크게 볼 수 있습니다</span></div><Gallery items={item.photos.map(photo=>({...photo,hideTitle:true,trimFooter:item.id==='2026-10-13-instagram-DebGXb8oBkl'}))} onOpen={onOpen} showCaptions={false}/></section>}</article>;
}
function News({ data, limit, onLoadMore }) {
 const items=data.news;
 return <div className="wrap page"><PageHeader eyebrow="NEWS & EVENTS" title="소식"/>{items.length ? <NewsRows items={items.slice(0,limit)}/> : <Empty title="등록된 소식이 없습니다." link={null}>동아리 소식과 행사 안내를 이곳에서 전합니다.</Empty>}{items.length>limit && <div className="load-more"><button className="button outline" onClick={onLoadMore}><span>더보기</span><Arrow className="arrow-down"/></button></div>}</div>;
}
function LightboxIcon({ direction }) {
 const path = direction === 'previous' ? 'M20 12H4m6-6-6 6 6 6' : direction === 'next' ? 'M4 12h16m-6-6 6 6-6 6' : 'm6 6 12 12M18 6 6 18';
 return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Lightbox({ collection, index: initialIndex, onClose }) {
 const dialog=useRef(null), navigation=useRef(null);
 const previousButton=useRef(null), nextButton=useRef(null);
 const [view,setView]=useState({index:initialIndex,loading:false,error:''});
 const item=collection[view.index];
 useEffect(()=>{
  const node=dialog.current, previous=document.activeElement;
  node.showModal();
  const overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  navigation.current=createPhotoNavigation({initialIndex,count:collection.length,load:(i,priority)=>preloadPhoto(asset(collection[i].image.src),priority),onState:state=>{
   // Keep keyboard focus inside the viewer when an end-of-gallery arrow disappears.
   if(state.index===0 && document.activeElement===previousButton.current) nextButton.current?.focus();
   if(state.index===collection.length-1 && document.activeElement===nextButton.current) previousButton.current?.focus();
   setView(state);
  }});
  return()=>{navigation.current.dispose();navigation.current=null;node.close();document.body.style.overflow=overflow;previous?.focus();};
 },[collection,initialIndex]);
 function move(direction) { navigation.current?.move(direction); }
 function keys(e) { if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);} }
 return <dialog className="lightbox" ref={dialog} onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={keys} aria-label={`${item.title} 작품 상세`} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="lightbox-shell">
   <div className="lightbox-top"><span>STARFLOWER <i>/</i> {String(view.index+1).padStart(2,'0')} — {String(collection.length).padStart(2,'0')}</span><button type="button" className="icon-button" onClick={onClose} aria-label="작품 상세 닫기"><LightboxIcon/></button></div>
   <div className="lightbox-body" aria-busy={view.loading}>
    <div className={`lightbox-image${item.trimFooter ? ' trim-footer' : ''}`}><Photo key={item.image.src} image={item.image} full eager decoding="sync" fetchPriority="high" alt={item.title}/><div className="lightbox-controls"><>{view.index>0 && <button type="button" key="previous" ref={previousButton} className="icon-button" aria-label="이전 사진" onClick={()=>move(-1)}><LightboxIcon direction="previous"/></button>}{view.index<collection.length-1 && <button type="button" key="next" ref={nextButton} className="icon-button lightbox-next" aria-label="다음 사진" onClick={()=>move(1)}><LightboxIcon direction="next"/></button>}</></div><div className="lightbox-status" role="status">{view.loading ? '사진을 불러오는 중…' : view.error}</div></div>
    <div className="lightbox-info"><span className="eyebrow">PHOTO</span>{!item.hideTitle && <h2>{item.title}</h2>}<div className="prose">{paragraphs(item.description)}</div><PhotoInfo rows={item.metadata}/><a className="text-link" href={asset(item.image.src)} target="_blank" rel="noreferrer">사진 크게 열기<Arrow diagonal/></a></div>
   </div>
  </div>
 </dialog>;
}
function Footer({ data }) { const settings=data.settings; return <footer className="site-footer wrap"><div className="footer-main"><div className="footer-identity"><Brand settings={settings}/>{data.footerText && <p className="footer-details">{data.footerText}</p>}</div><div className="footer-links">{(data.footerLinks ?? footerLinks({},settings)).map((item,i)=><a key={i} href={linkURL(item.주소)} {...(/^https?:/.test(item.주소)?{target:'_blank',rel:'noreferrer'}:{})}><LinkIcon type={item.아이콘}/><span>{item.이름}</span></a>)}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} KAIST STARFLOWER</span><span>SINCE {settings.창립연도 || '1987'}</span></div></footer>; }
function getRoute(){ try {return decodeURIComponent(location.hash.slice(1).split('?')[0] || '/');}catch{return '/not-found';} }
function App(){
 const [data,setData]=useState(null),[error,setError]=useState(''),[route,setRoute]=useState(getRoute),[gallery,setGallery]=useState(null);const main=useRef(null);
 const [isPending,startNavigation]=useTransition();
 const [newsLimit,setNewsLimit]=useState(12);
 const newsScroll=useRef(0);
 useEffect(()=>{loadSiteData('data/site.json').then(setData).catch(()=>setError('사이트 내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'));},[]);
 useEffect(()=>{const listener=()=>{const next=getRoute();setGallery(null);startNavigation(()=>setRoute(next));};window.addEventListener('hashchange',listener);return()=>window.removeEventListener('hashchange',listener);},[]);
 useEffect(()=>{if(!data)return;window.scrollTo({top:route==='/news'?newsScroll.current:0,left:0,behavior:'instant'});const frame=requestAnimationFrame(()=>main.current?.focus({preventScroll:true}));return()=>{if(route==='/news')newsScroll.current=window.scrollY;cancelAnimationFrame(frame);};},[route,data]);
 useEffect(()=>{const titles={'/admin':'사이트 관리','/':'KAIST 천체관측 동아리','/about':'동아리 소개','/exhibitions':'천체사진 전시','/recruitment':'신입부원 모집','/news':'소식'};document.title=`${titles[route] || '천체사진과 소식'} — 별바라기`;},[route]);
 if(error) return <main className="loading"><Star/><p>{error}</p><button className="button primary" onClick={()=>location.reload()}>다시 시도</button></main>;
 if(!data) return <main className="loading" aria-busy="true"><DelayedNotice/></main>;
 const onOpen=(collection,index)=>setGallery({collection,index}); let page;
 if(route==='/')page=<Home data={data}/>;
 else if(route==='/admin')page=<Admin home={data.home}/>;
 else if(route==='/about')page=<About data={data}/>;
 else if(route==='/exhibitions')page=<Exhibitions data={data}/>;
 else if(route.startsWith('/exhibitions/'))page=<ExhibitionDetail key={route} id={route.slice('/exhibitions/'.length)} data={data} onOpen={onOpen}/>;
 else if(route==='/recruitment')page=<Recruitment data={data}/>;
 else if(route==='/news')page=<News data={data} limit={newsLimit} onLoadMore={()=>setNewsLimit(n=>n+12)}/>;
 else if(route.startsWith('/news/'))page=<NewsDetail key={route} data={data} onOpen={onOpen} id={route.slice('/news/'.length)}/>;
 else page=<div className="wrap page"><Empty title="페이지를 찾을 수 없습니다." link="#/" label="홈으로 돌아가기">주소를 확인하거나 홈에서 다시 시작해 주세요.</Empty></div>;
 return <><a className="skip-link" href="#main" onClick={e=>{e.preventDefault();main.current?.focus();}}>본문으로 건너뛰기</a><Navigation route={route} data={data}/><main id="main" ref={main} tabIndex={-1} aria-busy={isPending}><Suspense fallback={<RoutePlaceholder route={route} data={data}/>}>{page}</Suspense></main><DelayedNotice active={isPending}/><Footer data={data}/>{gallery&&<Lightbox {...gallery} onClose={()=>setGallery(null)}/>}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
