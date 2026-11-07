import { Plane, Box } from 'lucide-react';
import LegalPage, { LegalHeading, LegalList } from '../../components/LegalPage';

export const metadata = { title: 'Confiance & Sécurité - Jibli.tn' };

export default function SecuritePage() {
    return (
        <LegalPage title="Confiance & Sécurité">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
                        <Plane className="w-5 h-5 mr-2 text-primary" /> Pour les Voyageurs
                    </h2>
                    <LegalList>
                        <li><strong>Vérifiez toujours</strong> le contenu des colis ouverts.</li>
                        <li>Refusez tout paquet scellé dont vous ignorez le contenu.</li>
                        <li>Demandez une pièce d'identité à la remise.</li>
                    </LegalList>
                </div>
                <div className="bg-state-success/5 p-6 rounded-xl border border-state-success/10">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
                        <Box className="w-5 h-5 mr-2 text-state-success" /> Pour les Expéditeurs
                    </h2>
                    <LegalList>
                        <li>Ne confiez pas d'objets de haute valeur sans assurance.</li>
                        <li>Privilégiez les profils <strong>vérifiés</strong> (Email + Téléphone).</li>
                        <li>Payez à la livraison pour plus de sécurité.</li>
                    </LegalList>
                </div>
            </div>

            <LegalHeading>Notre processus de vérification</LegalHeading>
            <p>Chez Jibli.tn, nous mettons tout en œuvre pour créer une communauté de confiance.</p>
            <LegalList>
                <li>Vérification des emails systématique.</li>
                <li>Système d'avis communautaire transparent.</li>
                <li>Modération active des annonces suspectes.</li>
            </LegalList>
        </LegalPage>
    );
}
