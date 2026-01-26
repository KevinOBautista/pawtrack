export type UserRole = "owner" | "sitter";

export interface Profile {
	id: string;
	email: string;
	full_name: string | null;
	phone_number: string | null;
	role: UserRole;
	created_at: string;
	updated_at: string;
}
	
export interface Pet {
	id: string;
	owner_id: string;
	name: string;
	species: string;
	breed: string | null;
	age: number | null;
	weight: number | null;
	photo_url: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

export interface Medication {
	id: string;
	pet_id: string;
	name: string;
	dosage: string;
	frequency: string;
	time_of_day: string[];
	start_date: string;
	end_date: string | null;
	instructions: string | null;
	created_at: string;
	updated_at: string;
}

export interface DoseLog {
	id: string;
	medication_id: string;
	sitter_id: string | null;
	scheduled_time: string;
	administered_time: string | null;
	photo_url: string | null;
	notes: string | null;
	status: "pending" | "administered" | "missed";
	created_at: string;
	updated_at: string;
}

export type AssignmentStatus = "pending" | "accepted" | "declined" | "expired";

export interface SitterAssignment {
	id: string;
	pet_id: string;
	owner_id: string;
	sitter_id: string | null;
	sitter_email: string;
	start_date: string;
	end_date: string;
	status: AssignmentStatus;
	created_at: string;
	updated_at: string;
}
