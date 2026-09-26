import { useEffect, useRef } from 'react'
import { FINE, RM, lerp } from '../../motion/env'
import { S, useTick } from '../../motion/ticker'
import { bindCursor, cursor, type CursorMode } from '../../motion/cursor'

/**
 * The camera cursor: a tight dot and a lagging ring. Over links the ring grows;
 * in the hero it becomes the AF point (driven by the hero); over photos it's a
 * viewfinder reading the frame's EXIF from `data-exif`. Mouse only, never under
 * reduced motion — touch users keep their normal behaviour.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const readRef = useRef<HTMLSpanElement>(null)
  const afBoxRef = useRef<HTMLDivElement>(null)
  const afLblRef = useRef<HTMLDivElement>(null)
  const enabled = FINE && !RM

  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current!
    bindCursor({ root, afBox: afBoxRef.current, afLbl: afLblRef.current })
    const html = document.documentElement
    html.classList.add('has-cursor')

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element
      const tagged = target.closest<HTMLElement>('[data-cursor]')
      const link = target.closest('a, button')
      const tag = tagged?.dataset.cursor as CursorMode | undefined
      cursor.hover = tag === 'photo' ? 'photo'
        : link && tag !== 'dot' ? 'link'
        : tag ?? 'default'
      if (cursor.hover === 'photo' && readRef.current) readRef.current.textContent = tagged?.dataset.exif ?? ''
    }
    const onMove = (e: PointerEvent) => {
      if (cursor.seen) return
      cursor.seen = true
      cursor.dx = cursor.rx = e.clientX
      cursor.dy = cursor.ry = e.clientY
    }
    const down = () => root.classList.add('is-down')
    const up = () => root.classList.remove('is-down')
    const hide = () => root.classList.add('is-hidden')
    const show = () => root.classList.remove('is-hidden')
    document.addEventListener('pointerover', onOver)
    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('pointerdown', down)
    addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', hide)
    document.documentElement.addEventListener('pointerenter', show)
    return () => {
      html.classList.remove('has-cursor')
      document.removeEventListener('pointerover', onOver)
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerdown', down)
      removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', hide)
      document.documentElement.removeEventListener('pointerenter', show)
      bindCursor({ root: null, afBox: null, afLbl: null })
    }
  }, [enabled])

  useTick(() => {
    if (!cursor.seen) return
    cursor.dx = lerp(cursor.dx, S.px, 0.45); cursor.dy = lerp(cursor.dy, S.py, 0.45)
    cursor.rx = lerp(cursor.rx, S.px, 0.16); cursor.ry = lerp(cursor.ry, S.py, 0.16)
    dotRef.current!.style.transform = `translate3d(${cursor.dx}px,${cursor.dy}px,0)`
    ringRef.current!.style.transform = `translate3d(${cursor.rx}px,${cursor.ry}px,0)`
    // AF mode only while the hero allows it (un-scrolled, intro done)
    const mode: CursorMode = cursor.hover === 'af' && !cursor.afAllowed ? 'default' : cursor.hover
    if (mode !== cursor.mode) {
      cursor.mode = mode
      const root = rootRef.current!
      root.classList.toggle('is-link', mode === 'link')
      root.classList.toggle('is-dot', mode === 'dot')
      root.classList.toggle('is-photo', mode === 'photo')
      root.classList.toggle('is-af', mode === 'af')
    }
  }, { enabled })

  if (!enabled) return null
  return (
    <div className="cursor" ref={rootRef} aria-hidden="true">
      <div className="cur-ring" ref={ringRef}>
        <div className="cur-circle" />
        <div className="vf brk"><i /><i /><i /><i /><span className="pt" /><span className="read" ref={readRef} /></div>
        <div className="af">
          <div className="box brk" ref={afBoxRef}><i /><i /><i /><i /></div>
          <div className="lbl" ref={afLblRef}>AF-S ●</div>
        </div>
      </div>
      <div className="cur-dot" ref={dotRef}><i /></div>
    </div>
  )
}
