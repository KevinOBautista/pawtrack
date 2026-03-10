"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { createPet, updatePet } from "@/lib/actions/pets";
import { createClient } from "@/lib/supabase/client";
import type { Pet } from "@/lib/types/database";

interface PetFormProps {
	pet?: Pet; // Optional - present for edit, absent for create
	mode: "create" | "edit";
}

const SPECIES_OPTIONS = [
	"Dog",
	"Cat",
	"Bird",
	"Rabbit",
	"Hamster",
	"Guinea Pig",
	"Reptile",
	"Other",
];

export function PetForm({ pet, mode }: PetFormProps) {
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [species, setSpecies] = useState(pet?.species || "Dog");
	const [photoPreview, setPhotoPreview] = useState<string | null>(
		pet?.photo_url || null,
	);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const router = useRouter();

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setPhotoFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPhotoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		const formData = new FormData(e.currentTarget);

		// Add species to formData since controlled Select doesn't add it automatically
		formData.set("species", species);

		startTransition(async () => {
			let photoUrl = pet?.photo_url || null;

			// Upload photo if selected
			if (photoFile) {
				const supabase = createClient();
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (user) {
					const timestamp = Date.now();
					const fileName = `${user.id}/${mode === "edit" && pet ? pet.id : "new"}/${timestamp}-${photoFile.name}`;

					const { data, error: uploadError } = await supabase.storage
						.from("pet-photos")
						.upload(fileName, photoFile);

					if (uploadError) {
						setError(`Photo upload failed: ${uploadError.message}`);
						return;
					}

					const {
						data: { publicUrl },
					} = supabase.storage.from("pet-photos").getPublicUrl(fileName);

					photoUrl = publicUrl;
				}
			}

			// Add photo URL to form data
			if (photoUrl) {
				formData.append("photo_url", photoUrl);
			}

			let result;
			if (mode === "edit" && pet) {
				result = await updatePet(pet.id, formData);
			} else {
				result = await createPet(formData);
			}

			if (result?.error) {
				setError(result.error);
			}
			// If no error, server action will redirect
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{mode === "create" ? "Add New Pet" : "Edit Pet"}</CardTitle>
				<CardDescription>
					{mode === "create"
						? "Add a new pet to your account"
						: "Update your pet information"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit}>
					<div className="flex flex-col gap-6">
						{/* Name - Required */}
						<div className="grid gap-2">
							<Label htmlFor="name">
								Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="Buddy"
								required
								defaultValue={pet?.name}
							/>
						</div>

						{/* Species - Required */}
						<div className="grid gap-2">
							<Select
								name="species"
								value={species}
								onValueChange={setSpecies}
								required
							>
								<Label htmlFor="species">
									Species <span className="text-red-500">*</span>
								</Label>
								<SelectTrigger id="species" className="w-full">
									<SelectValue placeholder="Select species" />
								</SelectTrigger>
								<SelectContent>
									{SPECIES_OPTIONS.map((option) => (
										<SelectItem id={option} key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Breed - Optional */}
						<div className="grid gap-2">
							<Label htmlFor="breed">Breed</Label>
							<Input
								id="breed"
								name="breed"
								type="text"
								placeholder="Golden Retriever"
								defaultValue={pet?.breed || ""}
							/>
						</div>

						{/* Age - Optional */}
						<div className="grid gap-2">
							<Label htmlFor="age">Age (years)</Label>
							<Input
								id="age"
								name="age"
								type="number"
								min="0"
								max="100"
								step="0.5"
								placeholder="3"
								defaultValue={pet?.age || ""}
							/>
						</div>

						{/* Weight - Optional */}
						<div className="grid gap-2">
							<Label htmlFor="weight">Weight (lbs)</Label>
							<Input
								id="weight"
								name="weight"
								type="number"
								min="0"
								step="0.1"
								placeholder="45"
								defaultValue={pet?.weight || ""}
							/>
						</div>

						{/* Notes - Optional */}
						<div className="grid gap-2">
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								name="notes"
								placeholder="Any special notes about your pet..."
								rows={4}
								defaultValue={pet?.notes || ""}
							/>
						</div>

						{/* Photo Upload - Optional */}
						<div className="grid gap-2">
							<Label htmlFor="photo">Photo</Label>
							{photoPreview && (
								<div className="relative w-32 h-32 mb-2">
									<img
										src={photoPreview}
										alt="Pet preview"
										className="w-full h-full object-cover rounded-lg"
									/>
								</div>
							)}
							<Input
								id="photo"
								name="photo"
								type="file"
								accept="image/jpeg,image/png,image/webp"
								onChange={handlePhotoChange}
							/>
							<p className="text-xs text-muted-foreground">
								Upload a photo of your pet (max 5MB)
							</p>
						</div>

						{/* Error Display */}
						{error && <p className="text-sm text-red-500">{error}</p>}

						{/* Submit Button */}
						<div className="flex gap-4">
							<Button type="submit" className="flex-1" disabled={isPending}>
								{isPending
									? mode === "create"
										? "Adding Pet..."
										: "Updating Pet..."
									: mode === "create"
										? "Add Pet"
										: "Update Pet"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
								disabled={isPending}
							>
								Cancel
							</Button>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
