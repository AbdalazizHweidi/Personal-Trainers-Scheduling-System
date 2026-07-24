type Props = { id: number; full_name: string; specialties: string[] };

export function TrainerCard({ id, full_name, specialties }: Props) {
  const initials = full_name.split(" ").map((n) => n[0]).join("");
  return (
    <div className="card trainer-card">
      <div className="avatar">{initials}</div>
      <div>
        <h4>{full_name}</h4>
        <div className="tags" style={{ marginTop: 4 }}>
          {specialties.map((s) => (
            <span className="tag" key={s}>{s}</span>
          ))}
        </div>
      </div>
      <a href={`/trainers/${id}`} className="btn btn-ghost btn-sm">View profile →</a>
    </div>
  );
}