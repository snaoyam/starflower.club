import React, {useEffect, useState, useRef} from "react"
import {css} from '@emotion/css'
import Top from './components/top'
import Content from './components/content'

function Home({setTopBarCss, divRef}) {
  const fullpagecss = css({
    'overflowY': 'hidden',
    'height': '100vh',
  })

  const prevDeltaY = useRef(0)
  const deltaYDupCheck = useRef(true)
  const scrollLock = useRef(true)
  const touchInit = useRef(0)

  const [page, setPage] = useState(0)
  const pageRef = useRef(page)
  pageRef.current = page
  const prev = () => {
    setPage(0)
    setTopBarCss(0)
    window.scrollTo(0,0)
    document.body.classList.add(fullpagecss)
    scrollLock.current = true
  }
  const next = () => {
    setPage(1)
    setTopBarCss(0.8)
    window.setTimeout(() => {
      if(pageRef.current === 1) {
        document.body.classList.remove(fullpagecss)
        scrollLock.current = false
      }
    }, 1000)
  }
  useEffect(() => {
    setTopBarCss(0)
    document.body.classList.add(fullpagecss)
    document.getElementById('SFHomep').addEventListener("click", prev)
    return () => {
      document.body.classList.remove(fullpagecss)
      document.getElementById('SFHomep').removeEventListener("click", prev)
    }
  }, [])
  useEffect(() => {
    const wheelHandler = (e) => {
      const {deltaY} = e
      if(scrollLock.current || (!scrollLock.current && document.documentElement.scrollTop <= 0 && deltaY < 0)) {
        e.preventDefault()
        if(deltaYDupCheck.current) {
          if(deltaY < 0 && deltaY < prevDeltaY.current) {
            deltaYDupCheck.current = false
            prev()
          }
          else if(deltaY > 0 && deltaY > prevDeltaY.current) {
            deltaYDupCheck.current = false
            next()
          }
        }
      }
      if((deltaY < 0 && deltaY > prevDeltaY.current) || (deltaY > 0 && deltaY < prevDeltaY.current)) {
        deltaYDupCheck.current = true
      }
      window.setTimeout(() => {
        prevDeltaY.current = deltaY
      }, 10)
    }

    const touchStart = (e) => {
      touchInit.current = e.touches[0].clientY
      deltaYDupCheck.current = true
    }
    const touchMove = (e) => {
      const deltaY = touchInit.current - e.touches[0].clientY
      if(scrollLock.current || (!scrollLock.current && document.documentElement.scrollTop <= 0 && deltaY < 0)) {
        e.preventDefault()
        if(deltaYDupCheck.current) {
          if(deltaY < -10) {
            deltaYDupCheck.current = false
            prev()
          }
          else if(deltaY > 10) {
            deltaYDupCheck.current = false
            next()
          }
        }
      }
    }

    divRef.current.addEventListener("wheel", wheelHandler)
    divRef.current.addEventListener('touchstart', touchStart)
    divRef.current.addEventListener('touchmove', touchMove)
    return () => {
      divRef.current.removeEventListener("wheel", wheelHandler)
      divRef.current.removeEventListener('touchstart', touchStart)
      divRef.current.removeEventListener('touchmove', touchMove)
    }
  }, [])

  const fullpagescroll = css({
    'transform': `translateY(${-page * 100}vh)`,
    'transition': 'transform 0.5s ease',
    'willChange': 'transform',
  })

  return (
    <div className={fullpagescroll}>
      <Top page={page}/>
      <Content />
    </div>
  )
}

export default Home