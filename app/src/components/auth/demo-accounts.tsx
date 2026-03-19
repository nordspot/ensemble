'use client';

import { useState } from 'react';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@ensemble.events', password: 'Admin123!', role: 'superadmin', name: 'Dr. Daniel Kunz', org: 'Nord GmbH' },
  { label: 'Organisator', email: 'organizer@ensemble.events', password: 'Demo123!', role: 'organizer', name: 'Prof. Dr. Sarah Weber', org: 'Universitätsspital Bern' },
  { label: 'Referent 1', email: 'speaker1@ensemble.events', password: 'Demo123!', role: 'speaker', name: 'Prof. Dr. Thomas Müller', org: 'ETH Zürich' },
  { label: 'Referent 2', email: 'speaker2@ensemble.events', password: 'Demo123!', role: 'speaker', name: 'Dr. Anna Fischer', org: 'Inselspital Bern' },
  { label: 'Referent 3', email: 'speaker3@ensemble.events', password: 'Demo123!', role: 'speaker', name: 'Dr. Marc Dubois', org: 'CHUV Lausanne' },
  { label: 'Teilnehmer 1', email: 'attendee1@ensemble.events', password: 'Demo123!', role: 'attendee', name: 'Lisa Schneider', org: 'Kantonsspital Zürich' },
  { label: 'Teilnehmer 2', email: 'attendee2@ensemble.events', password: 'Demo123!', role: 'attendee', name: 'Marco Rossi', org: 'Ospedale Civico Lugano' },
  { label: 'Aussteller', email: 'exhibitor@ensemble.events', password: 'Demo123!', role: 'attendee', name: 'Stefan Meier', org: 'MedTech Solutions AG' },
] as const;

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  organizer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  speaker: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  attendee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export function DemoAccounts() {
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(email: string, password: string) {
    // Set native input values and dispatch input events so React picks them up
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;

    if (emailInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      nativeInputValueSetter?.call(emailInput, email);
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (passwordInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      nativeInputValueSetter?.call(passwordInput, password);
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-ensemble-200/60 bg-ensemble-50/50 px-4 py-3 text-left text-sm font-medium text-ensemble-600 transition-colors hover:bg-ensemble-100/50 dark:border-ensemble-700/40 dark:bg-ensemble-800/30 dark:text-ensemble-400 dark:hover:bg-ensemble-800/50"
      >
        <span>Demo-Zugänge</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1.5 rounded-xl border border-ensemble-200/60 bg-white/60 p-3 backdrop-blur-sm dark:border-ensemble-700/40 dark:bg-ensemble-900/40">
          <p className="mb-2 px-1 text-xs text-ensemble-400 dark:text-ensemble-500">
            Klicken Sie auf einen Zugang, um die Anmeldedaten automatisch auszufüllen.
          </p>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => handleSelect(account.email, account.password)}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-ensemble-100/70 dark:hover:bg-ensemble-800/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ensemble-800 dark:text-ensemble-200">
                    {account.name}
                  </span>
                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${ROLE_COLORS[account.role] ?? ''}`}>
                    {account.label}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-ensemble-400 dark:text-ensemble-500">
                  <span className="truncate">{account.email}</span>
                  <span className="text-ensemble-300 dark:text-ensemble-600">|</span>
                  <span className="font-mono">{account.password}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-ensemble-400 dark:text-ensemble-500">
                  {account.org}
                </div>
              </div>
              <svg
                className="h-4 w-4 shrink-0 text-ensemble-300 transition-colors group-hover:text-accent-500 dark:text-ensemble-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
