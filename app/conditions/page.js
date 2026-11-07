import LegalPage, { LegalHeading, LegalList } from '../../components/LegalPage';

export const metadata = { title: "Conditions Générales d'Utilisation - Jibli.tn" };

export default function ConditionsPage() {
    return (
        <LegalPage title="Conditions Générales d'Utilisation">
            <p className="text-lg">Dernière mise à jour : 28 Janvier 2024</p>

            <LegalHeading>1. Introduction</LegalHeading>
            <p>Bienvenue sur Jibli.tn. En utilisant notre plateforme, vous acceptez les présentes conditions.</p>

            <LegalHeading>2. Objet du service</LegalHeading>
            <p>
                Jibli.tn est une plateforme de mise en relation entre des particuliers (Co-valisage).
                Jibli.tn n'est pas un transporteur et n'assure pas le transport des biens.
            </p>

            <LegalHeading>3. Responsabilités</LegalHeading>
            <LegalList>
                <li><strong>Voyageur :</strong> Vous êtes seul responsable du contenu de vos bagages. Vous devez vérifier la nature des objets remis.</li>
                <li><strong>Expéditeur :</strong> Vous certifiez que les objets remis sont légaux et ne contreviennent pas aux lois douanières.</li>
            </LegalList>

            <LegalHeading>4. Interdictions</LegalHeading>
            <p>
                Il est strictement interdit de transporter : Drogues, Armes, Produits contrefaits,
                Devises non déclarées au delà des seuils légaux.
            </p>

            <LegalHeading>5. Litiges</LegalHeading>
            <p>Jibli.tn ne peut être tenu responsable en cas de perte, vol ou saisie douanière.</p>
        </LegalPage>
    );
}
