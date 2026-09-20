const policies = [
  [
    "Booking & Payment",
    "Your event date is reserved once the required non-refundable deposit is received and your booking is confirmed. The remaining balance is due 7 days before your event.",
  ],
  ["Deposit", "The deposit is applied toward your total package price and is non-refundable."],
  [
    "Cancellation",
    "If you need to cancel your event, please notify Strike A Pose as soon as possible. The deposit will not be refunded.",
  ],
  [
    "Rescheduling",
    "Rescheduling may be available based on our availability. Your deposit may be transferred to a new date, subject to approval and availability.",
  ],
  [
    "Agreement",
    "By booking with Strike A Pose, you acknowledge that you have read, understood, and agreed to our Booking, Payment & Cancellation Policy and the terms of your event agreement.",
  ],
] as const;

export default function BookingPolicy() {
  return (
    <div className="policy-copy">
      <h2>Booking, Payment &amp; Cancellation Policy</h2>
      <p className="policy-intro">Please review our policies before submitting your inquiry.</p>
      <div className="policy-accordion">
        {policies.map(([title, content], index) => (
          <details key={title} className="policy-item">
            <summary>
              <span className="policy-number">{index + 1}</span>
              <span>{title}</span>
            </summary>
            <p>{content}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
