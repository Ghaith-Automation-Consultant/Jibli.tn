'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

/** Uses the native share sheet where available (mobile), otherwise copies the page link. */
export default function ShareButton({ title }) {
    const [copied, setCopied] = useState(false);

    const share = async () => {
        const url = window.location.href;
        if (navigator.share) {
            // A dismissed share sheet rejects; that is not an error worth reporting.
            await navigator.share({ title, url }).catch(() => { });
            return;
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt('Copiez ce lien :', url);
        }
    };

    return (
        <button
            type="button"
            onClick={share}
            className="w-full py-2.5 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-lg hover:bg-neutral-50 transition-colors text-xs flex items-center justify-center"
        >
            {copied ? (
                <><Check className="w-4 h-4 mr-1.5 text-state-success" /> Lien copié</>
            ) : (
                <><Share2 className="w-4 h-4 mr-1.5 text-neutral-400" /> Partager</>
            )}
        </button>
    );
}
