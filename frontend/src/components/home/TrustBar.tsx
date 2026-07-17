import { ShieldIcon, TruckIcon, HeadsetIcon, TagIcon, CardIcon } from "./icons";

const ITEMS = [
  { Icon: ShieldIcon, name: "Premium Quality", desc: "Genuine 3D printers and accessories" },
  { Icon: TruckIcon, name: "Fast Delivery", desc: "Nationwide shipping across Bangladesh" },
  { Icon: HeadsetIcon, name: "Expert Support", desc: "Guidance from 3D printing experts" },
  { Icon: TagIcon, name: "Best Prices", desc: "Competitive pricing on every order" },
  { Icon: CardIcon, name: "Secure Payments", desc: "Safe and trusted payment methods" },
];

export function TrustBar() {
  return (
    <section className="pbd-wrap" style={{ marginTop: 40 }}>
      <div className="pbd-trust">
        <h2 className="pbd-trust-title">Why Choose Prototype BD?</h2>
        {ITEMS.map(({ Icon, name, desc }) => (
          <div key={name} className="pbd-trust-item">
            <span className="pbd-trust-icon">
              <Icon size={26} />
            </span>
            <span className="pbd-trust-name">{name}</span>
            <span className="pbd-trust-desc">{desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
