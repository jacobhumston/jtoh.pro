import { updateRequestChart, updateRequestStats } from '../components/cardInfo';
import { handleCopyLinks } from '../components/copyLinks';
import { handleImageExampleControls } from '../components/exampleImageControls';

export default function () {
    updateRequestStats('cscd');
    updateRequestChart('cscd');
    handleImageExampleControls('/cscd/$username');
    handleCopyLinks();
}
