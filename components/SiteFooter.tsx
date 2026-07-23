const SiteFooter = () => {
  return (
    <footer className="bg-ink text-[#9aa0a6] px-10 py-10 text-[13px]">
      <div className="max-w-wrap mx-auto flex justify-between flex-wrap gap-6">
        <div>
          <b className="text-white font-display text-xl block mb-2.5">
            FITCONNECT
          </b>
          <p>
            142 Iron Row, Downtown
            <br />
            Mon–Fri 6a–9p · Sat–Sun 8a–4p
          </p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2">Studio</p>
          <p>About · Trainers · Pricing · Contact</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2">Account</p>
          <p>Log in · Sign up · My bookings</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
