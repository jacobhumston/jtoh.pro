import { updateRequestStats } from '../components/cardInfo';
import { handleImageExampleControls } from '../components/exampleImageControls';

export default function () {
    updateRequestStats();
    handleImageExampleControls('/$username');
}
