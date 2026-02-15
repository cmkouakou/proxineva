"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ServiceRequestSchema,
  type ServiceRequestInput,
} from "@/lib/validators/serviceRequest";

export default function RequestForm() {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ServiceRequestInput>({
    resolver: zodResolver(ServiceRequestSchema),
    defaultValues: {
      zone: "CANADA",
      category: "DEPANNAGE",
      mode: "EN_LIGNE",
      priority: "NORMAL",
      full_name: "",
      email: "",
      phone: "",
      description: "",
    },
  });

  async function onSubmit(values: ServiceRequestInput) {
    setServerMsg(null);
    setServerOk(null);

    const res = await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();

    if (!res.ok) {
      setServerOk(false);
      // message lisible
      const msg =
        json?.error === "Validation error"
          ? "Certains champs sont invalides. Vérifie le formulaire."
          : json?.error || "Erreur serveur.";
      setServerMsg(msg);
      return;
    }

    setServerOk(true);
    setServerMsg(`Demande envoyée ✅ (ID: ${json?.request?.id ?? "OK"})`);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Bloc statut serveur */}
      {serverMsg && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            serverOk ? "border-green-300" : "border-red-300"
          }`}
        >
          {serverMsg}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Zone</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            {...register("zone")}
          >
            <option value="CANADA">Canada</option>
            <option value="CIV">Côte d’Ivoire</option>
          </select>
          {errors.zone && (
            <p className="mt-1 text-sm text-red-600">{errors.zone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Type de demande</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            {...register("category")}
          >
            <option value="DEPANNAGE">Dépannage</option>
            <option value="SECURITE">Sécurité / Anti-arnaques</option>
            <option value="EXCEL">Excel</option>
            <option value="POWERPOINT">PowerPoint</option>
            <option value="O365">Microsoft 365</option>
            <option value="AUTRE">Autre</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Canal</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            {...register("mode")}
          >
            <option value="EN_LIGNE">En ligne</option>
            <option value="DOMICILE">À domicile</option>
          </select>
          {errors.mode && (
            <p className="mt-1 text-sm text-red-600">{errors.mode.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Urgence</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            {...register("priority")}
          >
            <option value="NORMAL">Normal</option>
            <option value="EXPRESS">Express</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">
              {errors.priority.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Nom complet</label>
          <input
            className="mt-1 w-full rounded-md border p-2"
            placeholder="Ex: Kouakou Claude"
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-md border p-2"
            placeholder="ex: nom@email.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Téléphone (optionnel)</label>
          <input
            className="mt-1 w-full rounded-md border p-2"
            placeholder="ex: +1 514 ..."
            {...register("phone")}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full rounded-md border p-2"
          rows={5}
          placeholder="Décris ton besoin (au moins 10 caractères)."
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
      </button>
    </form>
  );
}
