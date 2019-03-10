const createTableText = `
drop table events;

create table if not exists events (
  id serial primary key not null,
  aggregate_id uuid not null,
  type text not null,
  version integer not null,
  body jsonb not null,
  meta jsonb,
  at timestamptz not null default now(),
  unique (aggregate_id, version)
);

create index if not exists idx_aggregate_id on events using btree (aggregate_id);
`;

export async function migrate(client) {
  await client.query(createTableText);
}
