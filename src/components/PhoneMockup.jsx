import { DEMO_PHONE_PRODUCTS } from '../data/demoStore.js'

/** Pure-CSS 3D smartphone showing a live Digital Dukaan storefront. */
export function PhoneMockup() {
  return (
    <div className="phone-scene" aria-hidden="true">
      <div className="phone-tilt">
        <div className="phone">
          <div className="phone-island" />
          <div className="phone-screen">
            <div className="pm-top">
              <div className="pm-top-avatar">M</div>
              <div className="pm-top-text">
                <strong>Meera Fashion</strong>
                <span>Vijayawada · WhatsApp store</span>
              </div>
              <div className="pm-top-cart">🛒<i>2</i></div>
            </div>
            <div className="pm-searchbox">🔎 Search products…</div>
            <div className="pm-catrow">
              <span className="pm-cat active">All</span>
              <span className="pm-cat">Sarees</span>
              <span className="pm-cat">Kurtis</span>
              <span className="pm-cat">Jewellery</span>
              <span className="pm-cat">Giftings</span>
            </div>
            <div className="pm-grid2">
              {DEMO_PHONE_PRODUCTS.map((p) => (
                <div className="pm-mini" key={p.name}>
                  <img src={p.image} alt="" loading="lazy" />
                  <div className="pm-mini-body">
                    <span>{p.name}</span>
                    <em>{p.price}</em>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-cartbar">
              <span>🛒 Cart (2) · ₹1,898</span>
              <button className="pm-wa">Order on WhatsApp 💬</button>
            </div>
          </div>
        </div>
        <div className="phone-shadow" />
      </div>

      <span className="float-obj fo-bag">🛍️</span>
      <span className="float-obj fo-box">📦</span>
      <span className="float-obj fo-chat">💬</span>
      <span className="float-obj fo-star">✨</span>
      <span className="float-obj fo-rupee">💰</span>
    </div>
  )
}
