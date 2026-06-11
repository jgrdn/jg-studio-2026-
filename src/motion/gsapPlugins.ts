import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { Draggable } from 'gsap/Draggable'

let registered = false

/** Register GSAP plugins once (safe to call repeatedly). */
export function registerGsapPlugins() {
  if (registered) return
  gsap.registerPlugin(useGSAP, ScrollTrigger, Observer, InertiaPlugin, Draggable)
  registered = true
}

export { ScrollTrigger, Observer, Draggable }
