import { _ } from '../libs/global';
import { createErrorPopup } from '../libs/quick-elements';
import { getWebToken } from '../libs/security';
import { addClass, getBody, getElementByIdExpected, newElementCreator } from '../libs/util';

export default async function () {
    const body = await getBody();

    newElementCreator(body)(
        'form',
        (addChild) =>
            addChild('label', _, (label) => {
                label.innerText = 'What service are you providing feedback on?';
            })(
                'select',
                (addChild) =>
                    addChild('option', _, (option) => {
                        option.text = 'Website';
                    })('option', _, (option) => {
                        option.text = 'Discord Bot';
                    })('option', _, (option) => {
                        option.text = 'All of the above';
                    })('option', _, (option) => {
                        option.text = 'Other';
                    }),
                (select) => {
                    select.id = 'feedbackServiceSelect';
                    select.name = 'Service';
                    select.required = true;
                }
            )('label', _, (label) => {
                label.innerText = 'Provide your feedback below.';
            })('textarea', _, (input) => {
                input.placeholder =
                    "Enter your feedback here. If you selected 'Other', please specify what you are providing feedback on.";
                input.minLength = 100;
                input.maxLength = 3000;
                input.required = true;
                input.id = 'feedbackInput';
                input.name = 'feedback';
            })('label', _, (label) => {
                label.innerText = 'Once your done, press the submit button below.';
            })('button', _, (button) => {
                button.type = 'submit';
                button.innerText = 'Submit';
                button.id = 'feedbackSubmit';
            }),
        (form) => {
            form.id = 'feedbackForm';
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const submit = getElementByIdExpected('feedbackSubmit', 'button');
                const serviceSelect = getElementByIdExpected('feedbackServiceSelect', 'select');
                const feedbackInput = getElementByIdExpected('feedbackInput', 'textarea');
                if (!submit || !serviceSelect || !feedbackInput) return;
                submit.disabled = true;
                const captchaToken = await getWebToken();
                const response = await fetch(`/api/feedback/submit?captcha=${captchaToken}`, {
                    method: 'post',
                    body: JSON.stringify({ service: serviceSelect.value, input: feedbackInput.value })
                });
                submit.disabled = false;
                if (response.ok) {
                    form.innerText = 'Your feedback has been submitted, thank you!';
                } else {
                    const error = await response.json();
                    createErrorPopup(error.error, false);
                }
            });
            addClass(form, 'interactionFlex');
        }
    );
}
