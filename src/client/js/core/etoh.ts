import { updateRequestStats } from '../components/cardInfo';
import { handleCopyLinks } from '../components/copyLinks';
import { handleImageExampleControls } from '../components/exampleImageControls';

export default function () {
    updateRequestStats();
    handleImageExampleControls('/$username');
    handleCopyLinks();
}
