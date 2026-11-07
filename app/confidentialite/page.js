import LegalPage, { LegalHeading, LegalList } from '../../components/LegalPage';

export const metadata = { title: 'Politique de Confidentialité - Jibli.tn' };

export default function ConfidentialitePage() {
    return (
        <LegalPage title="Politique de Confidentialité">
            <p>Votre vie privée est essentielle. Cette politique détaille le traitement de vos données.</p>

            <LegalHeading>1. Données collectées</LegalHeading>
            <p>Nous collectons les informations suivantes :</p>
            <LegalList>
                <li>Identité (Nom, Prénom, Email).</li>
                <li>Détails des voyages et demandes.</li>
                <li>Messages échangés sur la plateforme.</li>
            </LegalList>

            <LegalHeading>2. Utilisation des données</LegalHeading>
            <p>
                Vos données servent uniquement à fluidifier la mise en relation et assurer la sécurité du service.
                Nous ne revendons pas vos données à des tiers.
            </p>

            <LegalHeading>3. Cookies</LegalHeading>
            <p>Nous utilisons des cookies techniques pour maintenir votre session active.</p>

            <LegalHeading>4. Vos droits</LegalHeading>
            <p>
                Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de
                suppression de vos données. Contactez nous à privacy@jibli.tn.
            </p>
        </LegalPage>
    );
}
