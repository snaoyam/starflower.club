import * as React from 'react'
import {Component} from 'react'

export default class Video extends Component {
  componentDidMount() {
    const video = document.createElement('video')
    video.autoplay = true
    video.loop = true
    video.muted = true
    video.controls = false
    video.setAttribute('autoplay', 'autoplay')
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', 'playsinline')
    video.setAttribute('src', 'https://raw.githubusercontent.com/snaoyam/starflower.club/main/frontend/public/home/main/2-4-intro.mp4')
    this.videoContainer.appendChild(video)
  }
  render() {
    return (<div ref={(ref) => { this.videoContainer = ref }} />)
  }
}