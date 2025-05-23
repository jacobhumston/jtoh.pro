import { updateRequestChart, updateRequestStats } from '../components/card-info';
import { handleCopyLinks } from '../components/copy-links';
import { handleImageExampleControls } from '../components/example-image-controls';

export default function () {
    updateRequestStats('etoh');
    updateRequestChart('etoh');
    handleImageExampleControls('/$username');
    handleCopyLinks();
}
