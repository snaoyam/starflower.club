import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, {useEffect, useState, useRef} from "react"
import {css} from '@emotion/css'
import Top from './page/top'
import Content from './page/content'

const fullpageThreshold = 30

function Home() {
  const fullpagecss = css({
    'overflowY': 'hidden',
    'height': '100vh',
  })
  document.body.classList.add(fullpagecss)
  const divRef = useRef()

  const scrollLock = useRef(true)
  const scrolling = useRef(false)
  const touchInit = useRef(0);

  const [page, setPage] = useState(0) 
  console.log(page)
  const prev = () => {
    setPage(p => (p-1))
  }
  const next = () => {
    setPage(p => p+1)
  }
  useEffect(() => document.getElementById('SFHomep').addEventListener("click", () => setPage(0)), [])
  useEffect(() => {
    const wheelHandler = (e) => {
      if(scrollLock.current) {
        e.preventDefault()
        const {deltaY} = e
        if(!scrolling.current && (deltaY > fullpageThreshold || deltaY < -fullpageThreshold)) {
          if(deltaY > fullpageThreshold) next()
          else if(deltaY < -fullpageThreshold) prev()
          scrolling.current = true
          window.setTimeout(() => {
            scrolling.current = false
          }, 700)
        }
      }
    }

    const touchStart = (e) => {
      touchInit.current = e.touches[0].clientY;
    }
    const touchMove = (e) => {
      if(scrollLock.current) {
        e.preventDefault()
        const deltaY = touchInit.current - e.touches[0].clientY;
        if (!scrolling.current && (deltaY > fullpageThreshold || deltaY < -fullpageThreshold)) {
          if(deltaY > fullpageThreshold) next()
          else if(deltaY < -fullpageThreshold) prev()
          scrolling.current = true
          window.setTimeout(() => {
            scrolling.current = false
          }, 700)
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
    <div ref={divRef} className={fullpagescroll}>
      <Top />
      <Content />
    </div>
  )
}

export default Home