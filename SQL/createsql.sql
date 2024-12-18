create table foods (
	id integer primary key,
	name varchar,
	price real
)

create table filings (
	id integer,
	idFood integer,
	name varchar,
	price real,
	primary key (id, idFood),
	foreign key (idFood) references foods(id)
)

create table sales (
	id serial primary key,
	idFood integer,
	cpf varchar,
	datesale TIMESTAMP DEFAULT NOW(),
	description varchar,
	price real,
	foreign key (idFood) references foods (id)
)
