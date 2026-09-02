/* WriteMode.jsx
   The full-screen writing experience for a letter: the whole background
   becomes the chosen theme colour, you type directly onto a real paper
   shape with live auto-shrinking text, and you can add up to 6 photos in
   any of nine frame shapes, each freely positioned, resized and rotated.

   Ported directly from the standalone write-mode-prototype.html this was
   built and tested in first. Recipient is decided before this component
   ever mounts (two buttons on the mailbox tab), not inside it. */

import { useEffect, useRef, useState } from "react";
import { LETTER_THEMES, THEME_ORDER } from "./letterThemes.js";
import { PHOTO_SHAPES, MAX_LETTER_PHOTOS, PhotoFrame, photoBackgroundStyle } from "./letterPhotos.jsx";
import { uid } from "../store.jsx";

const RECIPIENT_NAME = { his: "Vasi", hers: "Vijayal" };

export function WriteMode({ recipient, draft, setDraft, onSend, onClose, busy, error }) {
  const theme = draft.theme || "rose";
  const subject = draft.subject || "";
  const greeting = draft.greeting || "";
  const body = draft.body || "";
  const signoff = draft.signoff || "";
  const photos = draft.photos || [];

  const setTheme = (v) => setDraft({ ...draft, theme: v });
  const setSubject = (v) => setDraft({ ...draft, subject: v });
  const setGreeting = (v) => setDraft({ ...draft, greeting: v });
  const setBody = (v) => setDraft({ ...draft, body: v });
  const setSignoff = (v) => setDraft({ ...draft, signoff: v });
  const setPhotos = (updater) => setDraft({ ...draft, photos: typeof updater === "function" ? updater(photos) : updater });

  const [shapePopupOpen, setShapePopupOpen] = useState(false);
  const [pendingDataUrl, setPendingDataUrl] = useState(null);
  const [pendingImgRatio, setPendingImgRatio] = useState(1);
  const [pickedShape, setPickedShape] = useState("square");
  const [pickedPos, setPickedPos] = useState({ x: 50, y: 50 });
  const [pickedZoom, setPickedZoom] = useState(1);

  const sheetRef = useRef(null);
  const bodyTextRef = useRef(null);
  const fileInputRef = useRef(null);

  /* live-shrinking text: same approach as the letter reveal itself, so
     what you see while writing matches what actually gets sent */
  const autoScaleText = () => {
    const el = bodyTextRef.current;
    const sheet = sheetRef.current;
    if (!el || !sheet) return;
    const sheetWidth = sheet.clientWidth || window.innerWidth * 0.4;
    let fontSize = Math.min(Math.max(sheetWidth * 0.075, 18), 34);
    el.style.fontSize = fontSize + "px";
    while ((el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) && fontSize > 14) {
      fontSize -= 0.5;
      el.style.fontSize = fontSize + "px";
    }
  };
  useEffect(() => {
    autoScaleText();
    window.addEventListener("resize", autoScaleText);
    return () => window.removeEventListener("resize", autoScaleText);
  }, [body]);

  const themeVars = {
    "--pink": LETTER_THEMES[theme].page[0],
    "--pink-deep": LETTER_THEMES[theme].page[1],
  };

  const openFilePicker = () => {
    if (photos.length >= MAX_LETTER_PHOTOS) return;
    fileInputRef.current.click();
  };

  const onFileChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      const probe = new Image();
      probe.onload = () => {
        setPendingImgRatio(probe.naturalWidth / probe.naturalHeight || 1);
        setPendingDataUrl(url);
        setPickedShape("square");
        setPickedPos({ x: 50, y: 50 });
        setPickedZoom(1);
        setShapePopupOpen(true);
      };
      probe.onerror = () => {
        setPendingImgRatio(1);
        setPendingDataUrl(url);
        setShapePopupOpen(true);
      };
      probe.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const confirmPhoto = () => {
    if (!pendingDataUrl) return;
    const photo = {
      id: uid(),
      dataUrl: pendingDataUrl,
      shape: pickedShape,
      posX: pickedPos.x,
      posY: pickedPos.y,
      zoom: pickedZoom,
      imgRatio: pendingImgRatio,
      x: 40 + photos.length * 24,
      y: 120 + photos.length * 20,
      size: 140,
      rotation: 0,
    };
    setPhotos((p) => [...p, photo]);
    setShapePopupOpen(false);
    setPendingDataUrl(null);
  };

  const deletePhoto = (id) => setPhotos((p) => p.filter((x) => x.id !== id));
  const updatePhoto = (id, patch) => setPhotos((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleSend = () => {
    onSend({
      subject: subject.trim(),
      greeting: greeting.trim(),
      body,
      signoff: signoff.trim(),
      theme,
      photos,
    });
  };

  return (
    <div className="pf-write-mode open" style={themeVars}>
      <div className="pf-top-bar">
        <div className="pf-top-row">
          <div className="pf-top-left">
            <button className="pf-back-btn" onClick={onClose}>&#8592; back</button>
            <button className="pf-add-pic-wrap-btn" onClick={openFilePicker} disabled={photos.length >= MAX_LETTER_PHOTOS}>
              + add a picture
              <span className="pf-photo-count">{photos.length} / {MAX_LETTER_PHOTOS}</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileChosen} />
          </div>
          <button className="pf-send-btn" onClick={handleSend} disabled={busy}>
            {busy ? "sending..." : (<>Send it with love <span className="pf-heart">&#9829;</span></>)}
          </button>
        </div>
        <div className="pf-swatches">
          {THEME_ORDER.map((key) => (
            <button
              key={key}
              className={"pf-swatch" + (theme === key ? " selected" : "")}
              style={{ background: LETTER_THEMES[key].swatch }}
              title={LETTER_THEMES[key].label}
              onClick={() => setTheme(key)}
            />
          ))}
        </div>
      </div>

      {error && <p className="pf-error">{error}</p>}

      <div className="pf-subject-row">
        <label>Title</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="what this letter is about" />
      </div>

      <div className="pf-letter-wrap">
        <div className="pf-envelope">
          <div className="pf-env-back" />
          <div className="pf-env-inner-shadow" />
          <div className="pf-env-flap" />
          <div className="pf-env-pocket" />
          <div className="pf-env-side-flaps" />
        </div>

        <div className="pf-sheet" ref={sheetRef}>
          <input className="pf-greeting-line" value={greeting} onChange={(e) => setGreeting(e.target.value)} placeholder={`hi ${RECIPIENT_NAME[recipient] || ""}...`} />
          <textarea className="pf-body-text" ref={bodyTextRef} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Dear you..." />
          <div className="pf-sign-row">
            <input value={signoff} onChange={(e) => setSignoff(e.target.value)} placeholder="from ..." />
          </div>
        </div>
      </div>

      <div className="pf-photo-layer">
        {photos.map((photo) => (
          <PlacedPhoto key={photo.id} photo={photo} onChange={(patch) => updatePhoto(photo.id, patch)} onDelete={() => deletePhoto(photo.id)} />
        ))}
      </div>

      {shapePopupOpen && (
        <ShapePopup
          dataUrl={pendingDataUrl}
          imgRatio={pendingImgRatio}
          shape={pickedShape}
          setShape={setPickedShape}
          pos={pickedPos}
          setPos={setPickedPos}
          zoom={pickedZoom}
          setZoom={setPickedZoom}
          onCancel={() => { setShapePopupOpen(false); setPendingDataUrl(null); }}
          onConfirm={confirmPhoto}
        />
      )}

      <PfStyles />
    </div>
  );
}

/* ===================== shape picker popup ===================== */

function ShapePopup({ dataUrl, imgRatio, shape, setShape, pos, setPos, zoom, setZoom, onCancel, onConfirm }) {
  const stageRef = useRef(null);

  const onStagePointerDown = (e) => {
    const rect = stageRef.current.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const origPos = { ...pos };
    const move = (ev) => {
      const dxPct = ((ev.clientX - startX) / rect.width) * 100;
      const dyPct = ((ev.clientY - startY) / rect.height) * 100;
      setPos({
        x: Math.max(0, Math.min(100, origPos.x - dxPct)),
        y: Math.max(0, Math.min(100, origPos.y - dyPct)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className="pf-popup-veil open">
      <div className="pf-popup">
        <h3>pick a frame for this one</h3>
        <div className="pf-shape-row">
          {PHOTO_SHAPES.map((s) => (
            <div key={s.key} className={"pf-shape-option pf-frame-" + s.key + (s.key === shape ? " selected" : "")} onClick={() => setShape(s.key)}>
              <div className="pf-frame-preview">
                <PhotoFrame shape={s.key} dataUrl={dataUrl} imgRatio={imgRatio} pos={{ x: 50, y: 50 }} zoom={1} />
              </div>
              <div className="pf-bubble" />
            </div>
          ))}
        </div>
        <p className="pf-shape-hint">drag the bigger preview to choose what shows through the frame</p>
        <div className="pf-crop-stage">
          <div className={"pf-frame-preview pf-crop-box pf-frame-" + shape} ref={stageRef} onPointerDown={onStagePointerDown}>
            <PhotoFrame shape={shape} dataUrl={dataUrl} imgRatio={imgRatio} pos={pos} zoom={zoom} />
          </div>
        </div>
        <div className="pf-zoom-controls">
          <button type="button" onClick={() => setZoom(Math.max(1, zoom - 0.15))} aria-label="Zoom out">&minus;</button>
          <button type="button" onClick={() => setZoom(Math.min(3, zoom + 0.15))} aria-label="Zoom in">+</button>
        </div>
        <div className="pf-popup-actions">
          <button className="pf-popup-cancel" onClick={onCancel}>Cancel</button>
          <button className="pf-popup-confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== a placed, draggable/resizable/rotatable photo ===================== */

function PlacedPhoto({ photo, onChange, onDelete }) {
  const elRef = useRef(null);
  const isMobileLayout = () => window.matchMedia("(max-width: 700px)").matches;

  const onPointerDownDrag = (e) => {
    if (isMobileLayout()) return;
    if (e.target.closest(".pf-resize-handle, .pf-delete-handle, .pf-rotate-handle, .pf-rotate-stem")) return;
    const startX = e.clientX, startY = e.clientY;
    const origX = photo.x, origY = photo.y;
    elRef.current.classList.add("dragging");
    const move = (ev) => {
      const x = origX + (ev.clientX - startX);
      const y = origY + (ev.clientY - startY);
      elRef.current.style.left = x + "px";
      elRef.current.style.top = y + "px";
      elRef.current.dataset.x = x;
      elRef.current.dataset.y = y;
    };
    const up = () => {
      elRef.current.classList.remove("dragging");
      onChange({ x: Number(elRef.current.dataset.x ?? origX), y: Number(elRef.current.dataset.y ?? origY) });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onResizeDown = (e) => {
    e.stopPropagation();
    if (isMobileLayout()) return;
    const startX = e.clientX, startY = e.clientY;
    const origSize = photo.size, origX = photo.x, origY = photo.y;
    const move = (ev) => {
      const delta = ((ev.clientX - startX) + (ev.clientY - startY)) / 2;
      const newSize = Math.max(60, Math.min(420, origSize + delta));
      const grow = newSize - origSize;
      const x = origX - grow / 2, y = origY - grow / 2;
      elRef.current.style.width = newSize + "px";
      elRef.current.style.height = (photo.shape === "oval" ? newSize * 0.75 : newSize) + "px";
      elRef.current.style.left = x + "px";
      elRef.current.style.top = y + "px";
      elRef.current.dataset.size = newSize;
      elRef.current.dataset.x = x;
      elRef.current.dataset.y = y;
    };
    const up = () => {
      onChange({
        size: Number(elRef.current.dataset.size ?? origSize),
        x: Number(elRef.current.dataset.x ?? origX),
        y: Number(elRef.current.dataset.y ?? origY),
      });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onRotateDown = (e) => {
    e.stopPropagation();
    if (isMobileLayout()) return;
    const handle = e.currentTarget;
    handle.classList.add("dragging");
    const move = (ev) => {
      const rect = elRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const angleRad = Math.atan2(ev.clientY - cy, ev.clientX - cx);
      const rotation = (angleRad * 180) / Math.PI + 90;
      elRef.current.style.transform = `rotate(${rotation}deg)`;
      elRef.current.dataset.rotation = rotation;
    };
    const up = () => {
      handle.classList.remove("dragging");
      onChange({ rotation: Number(elRef.current.dataset.rotation ?? photo.rotation) });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={elRef}
      className={"pf-placed-photo pf-frame-" + photo.shape}
      style={{
        left: photo.x, top: photo.y, width: photo.size,
        height: photo.shape === "oval" ? photo.size * 0.75 : photo.size,
        transform: `rotate(${photo.rotation}deg)`,
      }}
      onPointerDown={onPointerDownDrag}
    >
      <PhotoFrame shape={photo.shape} dataUrl={photo.dataUrl} imgRatio={photo.imgRatio} pos={{ x: photo.posX, y: photo.posY }} zoom={photo.zoom} />
      <button className="pf-delete-handle" aria-label="Delete this photo" onClick={(e) => { e.stopPropagation(); onDelete(); }}>&times;</button>
      <div className="pf-resize-handle" onPointerDown={onResizeDown} />
      <div className="pf-rotate-stem" />
      <div className="pf-rotate-handle" aria-label="Rotate this photo" onPointerDown={onRotateDown} />
    </div>
  );
}

/* ===================== styles ===================== */

function PfStyles() {
  return (
    <style>{`
      .pf-write-mode {
        position: fixed; inset: 0; z-index: 90;
        display: flex; flex-direction: column; align-items: center;
        padding: 28px 20px; overflow-y: auto;
        background: linear-gradient(160deg, var(--pink) 0%, var(--pink-deep) 100%);
      }
      .pf-top-bar { width: 100%; max-width: 640px; display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 14px; }
      .pf-top-row { width: 100%; display: flex; justify-content: center; align-items: center; gap: 30px; }
      .pf-top-left { display: flex; align-items: center; gap: 10px; }
      .pf-back-btn, .pf-add-pic-wrap-btn, .pf-send-btn {
        font-family: inherit; font-weight: 700; font-size: 14px; cursor: pointer;
        padding: 8px 18px; border-radius: 999px; border: 3px solid #8b6f47;
      }
      .pf-back-btn, .pf-add-pic-wrap-btn { background: rgba(255,255,255,.55); color: #4a3b28; }
      .pf-add-pic-wrap-btn { position: relative; display: flex; align-items: center; gap: 6px; }
      .pf-add-pic-wrap-btn:disabled { opacity: .4; cursor: default; }
      .pf-photo-count { font-size: 10px; font-weight: 600; opacity: .75; }
      .pf-send-btn { background: #f6b8cf; color: #6b3a4d; border-color: #d99bb0; display: inline-flex; align-items: center; gap: 6px; }
      .pf-send-btn:disabled { opacity: .6; cursor: default; }
      .pf-heart { color: #fff; }
      .pf-swatches { display: flex; gap: 7px; justify-content: center; }
      .pf-swatch {
        width: 22px; height: 22px; border-radius: 50%; cursor: pointer; padding: 0;
        border: 2px solid rgba(74,59,40,.3);
      }
      .pf-swatch.selected { border: 3px solid #4a3b28; box-shadow: 0 0 0 2px #fff; }
      .pf-error { color: #c96a6a; text-align: center; }

      .pf-subject-row { width: 100%; max-width: 640px; margin-bottom: 16px; }
      .pf-subject-row label { display: block; font-size: 12px; font-weight: 700; color: rgba(74,59,40,.7); margin-bottom: 4px; }
      .pf-subject-row input {
        width: 100%; box-sizing: border-box; font-family: inherit; font-size: 14px; padding: 7px 12px; border-radius: 10px;
        border: 2px solid rgba(74,59,40,.35); background: rgba(255,255,255,.6); color: #4a3b28;
      }

      .pf-letter-wrap { position: relative; }
      .pf-envelope {
        position: absolute; bottom: -3%; right: -22%;
        width: calc(var(--sheet-w, min(60vw,62vh)) * 0.6); aspect-ratio: 1.35 / 1;
        transform: rotate(12deg); z-index: 0;
        filter: drop-shadow(0 16px 24px rgba(100,60,80,.2));
      }
      .pf-env-back { position: absolute; inset: 0; background: linear-gradient(135deg, #ffffff, #f2e8ec); border-radius: 3px; }
      .pf-env-inner-shadow { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(80,50,65,.12) 0%, transparent 40%); clip-path: polygon(0 0, 50% 48%, 100% 0, 100% 100%, 0 100%); }
      .pf-env-flap { position: absolute; top: -1px; left: 0; right: 0; height: 58%; background: linear-gradient(180deg, #ffffff, #fbf7f8); clip-path: polygon(0 0, 100% 0, 50% 100%); border-radius: 2px; }
      .pf-env-pocket { position: absolute; inset: 0; background: linear-gradient(to bottom right, #ffffff, #f7f2f4); clip-path: polygon(0 0, 50% 48%, 100% 0, 100% 100%, 0 100%); border-radius: 3px; }
      .pf-env-side-flaps { position: absolute; inset: 0; background: linear-gradient(to right, #ffffff 0%, #fcf8fa 50%, #f4ebf0 100%); clip-path: polygon(0 0, 48% 46%, 0 100%, 100% 100%, 52% 46%, 100% 0); }

      .pf-sheet {
        width: min(60vw, 62vh); max-width: 640px; aspect-ratio: 3 / 4;
        background:
          repeating-linear-gradient(89deg, rgba(120,95,55,.04) 0px, transparent 1px, transparent 3px),
          repeating-linear-gradient(1deg, rgba(120,95,55,.03) 0px, transparent 1px, transparent 4px),
          radial-gradient(ellipse 45% 22% at 85% 10%, rgba(190,155,95,.18), transparent 60%),
          radial-gradient(ellipse 50% 24% at 10% 94%, rgba(175,140,85,.14), transparent 60%),
          linear-gradient(135deg, #f4ecd8 0%, #efe3c6 55%, #f4ecd8 100%);
        border: 1px solid #e2d4b4; box-shadow: 0 22px 34px rgba(120,70,90,.26);
        padding: 9% 10% 8%; display: flex; flex-direction: column; position: relative; z-index: 1;
      }
      .pf-greeting-line {
        width: 100%; font-family: 'Caveat', cursive; font-weight: 500; color: #36281e;
        font-size: 1.15em; margin-bottom: 6%; background: transparent; border: none; outline: none;
      }
      .pf-greeting-line::placeholder { color: rgba(54,40,30,.35); }
      .pf-body-text {
        flex: 1; width: 100%; min-width: 0; resize: none; border: none; outline: none; background: transparent;
        font-family: 'Caveat', cursive; font-weight: 500; color: #36281e; line-height: 1.35; letter-spacing: .5px; text-align: left;
      }
      .pf-body-text::placeholder { color: rgba(54,40,30,.35); }
      .pf-sign-row { display: flex; justify-content: flex-end; margin-top: 8px; }
      .pf-sign-row input {
        text-align: right; border: none; outline: none; background: transparent;
        font-family: 'Caveat', cursive; font-weight: 500; color: #36281e; font-size: 1.1em; width: 60%;
      }
      .pf-sign-row input::placeholder { color: rgba(54,40,30,.35); }

      .pf-photo-layer { position: relative; height: 0; z-index: 40; pointer-events: none; }
      .pf-placed-photo { position: absolute; width: 140px; height: 140px; pointer-events: auto; cursor: grab; touch-action: none; }
      .pf-placed-photo.dragging { cursor: grabbing; }
      .pf-placed-photo .pf-resize-handle { position: absolute; right: -6px; bottom: -6px; width: 18px; height: 18px; border-radius: 50%; background: #f6b8cf; border: 2px solid #8b6f47; cursor: nwse-resize; }
      .pf-placed-photo .pf-delete-handle { position: absolute; top: -8px; left: -8px; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 2px solid #8b6f47; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #a14b4b; }
      .pf-placed-photo .pf-rotate-stem { position: absolute; top: -26px; left: 50%; width: 2px; height: 20px; background: rgba(139,111,71,.5); transform: translateX(-50%); }
      .pf-placed-photo .pf-rotate-handle { position: absolute; top: -36px; left: 50%; width: 18px; height: 18px; border-radius: 50%; background: #8fd8cf; border: 2px solid #8b6f47; transform: translateX(-50%); cursor: grab; }
      .pf-placed-photo .pf-rotate-handle.dragging { cursor: grabbing; }

      .pf-frame-preview, .pf-frame-body { background-size: cover; background-position: center; width: 100%; height: 100%; position: relative; }
      .pf-frame-square .pf-frame-body { border-radius: 4px; border: 3px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); }
      .pf-frame-circle .pf-frame-body { border-radius: 50%; border: 3px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); }
      .pf-frame-oval .pf-frame-body { border-radius: 50%; border: 3px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); }
      .pf-frame-oval .pf-frame-preview, .pf-frame-oval.pf-placed-photo { aspect-ratio: 4 / 3; }
      .pf-frame-star .pf-frame-body { clip-path: url(#starClip); box-shadow: 0 3px 10px rgba(0,0,0,.2); }
      .pf-frame-heart .pf-frame-body { clip-path: url(#heartClip); box-shadow: 0 3px 10px rgba(0,0,0,.2); }
      .pf-frame-arch .pf-frame-body { border-radius: 50% 50% 4px 4px / 30% 30% 4px 4px; border: 3px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); }
      .pf-frame-cloud .pf-frame-body { clip-path: url(#cloudClip); box-shadow: 0 3px 10px rgba(0,0,0,.2); }
      .pf-frame-flower .pf-frame-body { clip-path: url(#flowerClip); box-shadow: 0 3px 10px rgba(0,0,0,.2); }
      .pf-frame-polaroid .pf-frame-body { background: #fff; padding: 8% 8% 22% 8%; box-shadow: 0 4px 12px rgba(0,0,0,.25); }
      .pf-frame-polaroid .pf-frame-body .pf-polaroid-img { width: 100%; height: 100%; background-size: cover; background-position: center; }

      .pf-popup-veil { position: fixed; inset: 0; z-index: 200; background: rgba(40,30,20,.45); display: flex; align-items: center; justify-content: center; padding: 20px; }
      .pf-popup { background: #fffaf0; border-radius: 22px; border: 3px solid #8b6f47; padding: 24px 20px; max-width: 800px; width: 100%; box-shadow: 0 16px 40px rgba(0,0,0,.3); }
      .pf-popup h3 { margin: 0 0 6px; text-align: center; font-family: 'Baloo 2', sans-serif; color: #4a3b28; }
      .pf-shape-hint { text-align: center; font-size: 12px; color: rgba(74,59,40,.65); margin-bottom: 16px; }
      .pf-shape-row { display: flex; flex-wrap: nowrap; gap: 12px; justify-content: center; margin-bottom: 10px; overflow-x: auto; }
      .pf-shape-option { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; flex-shrink: 0; }
      .pf-shape-option .pf-frame-preview { width: 64px; height: 64px; overflow: hidden; }
      .pf-bubble { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #8b6f47; background: transparent; }
      .pf-shape-option.selected .pf-bubble { background: #8b6f47; }
      .pf-crop-stage { display: flex; justify-content: center; margin-bottom: 10px; }
      .pf-crop-stage .pf-frame-preview { width: 170px; height: 170px; cursor: grab; touch-action: none; }
      .pf-zoom-controls { display: flex; justify-content: center; gap: 10px; margin-bottom: 12px; }
      .pf-zoom-controls button { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #8b6f47; background: rgba(255,255,255,.7); color: #4a3b28; font-size: 16px; font-weight: 800; cursor: pointer; }
      .pf-popup-actions { display: flex; justify-content: center; gap: 12px; }
      .pf-popup-actions button { font-family: inherit; font-weight: 700; font-size: 14px; cursor: pointer; padding: 9px 24px; border-radius: 999px; border: 3px solid #8b6f47; }
      .pf-popup-cancel { background: rgba(255,255,255,.6); color: #4a3b28; }
      .pf-popup-confirm { background: #f6b8cf; color: #6b3a4d; border-color: #d99bb0; }

      @media (max-width: 700px) {
        .pf-photo-layer { position: static; display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 18px; }
        .pf-placed-photo { position: static !important; transform: none !important; cursor: default; }
        .pf-placed-photo .pf-resize-handle, .pf-placed-photo .pf-rotate-handle, .pf-placed-photo .pf-rotate-stem { display: none; }
      }
    `}</style>
  );
}
