document.addEventListener('DOMContentLoaded', () => {
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const wasOpen = item.classList.contains('is-open');

            document.querySelectorAll('.faq-item.is-open').forEach(other => {
                if (other !== item) {
                    other.classList.remove('is-open');
                    other.querySelector('.faq-question')
                        ?.setAttribute('aria-expanded', 'false');
                }
            });

            item.classList.toggle('is-open', !wasOpen);
            btn.setAttribute('aria-expanded', String(!wasOpen));
        });
    });

    const dsModal = document.getElementById('ds-modal');
    const openDsBtn = document.getElementById('open-ds');
    let lastFocused = null;

    const openModal = () => {
        if (!dsModal) return;
        lastFocused = document.activeElement;
        dsModal.removeAttribute('hidden');
        dsModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        dsModal.querySelector('.modal-close')?.focus();
    };

    const closeModal = () => {
        if (!dsModal) return;
        dsModal.setAttribute('hidden', '');
        dsModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        lastFocused?.focus();
    };

    openDsBtn?.addEventListener('click', openModal);

    dsModal?.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-close')) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dsModal && !dsModal.hasAttribute('hidden')) {
            closeModal();
        }
    });


    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    const setHint = (fieldId, message, type) => {
        const hint = document.querySelector(`.form-hint[data-for="${fieldId}"]`);
        if (!hint) return;
        hint.textContent = message || '';
        hint.classList.remove('error', 'success');
        if (type) hint.classList.add(type);
    };

    const validators = {
        nombre: (v) => {
            if (!v.trim()) return 'El nombre es obligatorio.';
            if (v.trim().length < 3) return 'Mínimo 3 caracteres.';
            if (v.trim().length > 50) return 'Máximo 50 caracteres.';
            if (!/^[A-Za-zÀ-ÿ\s]+$/.test(v.trim())) return 'Solo letras y espacios.';
            return null;
        },
        telefono: (v) => {
            if (!v.trim()) return 'El teléfono es obligatorio.';
            if (!/^[0-9+\s\-]{7,15}$/.test(v.trim())) return 'Solo números, +, - y espacios (7 a 15 caracteres).';
            return null;
        },
        email: (v) => {
            if (!v.trim()) return 'El email es obligatorio.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Formato inválido. Ej: nombre@correo.com';
            return null;
        },
        objetivo: (v) => {
            if (!v) return 'Selecciona una opción.';
            return null;
        },
        consentimiento: (checked) => {
            if (!checked) return 'Debes aceptar para continuar.';
            return null;
        }
    };

    const fields = [
        { id: 'nombre', label: 'Nombre', getValue: (el) => el.value },
        { id: 'telefono', label: 'Teléfono', getValue: (el) => el.value },
        { id: 'email', label: 'Email', getValue: (el) => el.value },
        { id: 'objetivo', label: '¿Qué buscas?', getValue: (el) => el.value },
        { id: 'consentimiento', label: 'Consentimiento', getValue: (el) => el.checked }
    ];

    const validateField = (field) => {
        const el = document.getElementById(field.id);
        if (!el) return null;
        const value = field.getValue(el);
        const error = validators[field.id](value);
        if (error) {
            setHint(field.id, error, 'error');
        } else {
            const valueStr = typeof value === 'boolean' ? '' : String(value).trim();
            setHint(field.id, valueStr ? '✓ Correcto' : '', valueStr ? 'success' : null);
        }
        return error;
    };

    fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (!el) return;
        const eventName = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'blur';
        el.addEventListener(eventName, () => validateField(field));
        if (el.type !== 'checkbox' && el.tagName !== 'SELECT') {
            el.addEventListener('input', () => {
                const hint = document.querySelector(`.form-hint[data-for="${field.id}"]`);
                if (hint?.classList.contains('error')) validateField(field);
            });
        }
    });

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const errors = [];
        fields.forEach(field => {
            const error = validateField(field);
            if (error) errors.push(field.label);
        });

        if (errors.length > 0) {
            formFeedback.className = 'form-feedback show error';
            const list = errors.join(', ');
            formFeedback.textContent = errors.length === 1
                ? `Revisa el campo: ${list}.`
                : `Revisa estos ${errors.length} campos: ${list}.`;
            const firstError = contactForm.querySelector('.form-hint.error');
            const firstInvalidField = firstError?.getAttribute('data-for');
            if (firstInvalidField) {
                document.getElementById(firstInvalidField)?.focus();
            }
            return;
        }

        formFeedback.className = 'form-feedback show processing';
        formFeedback.textContent = 'Enviando solicitud...';

        setTimeout(() => {
            const nombre = document.getElementById('nombre')?.value.split(' ')[0] || 'gracias';
            formFeedback.className = 'form-feedback show success';
            formFeedback.textContent = `¡Listo, ${nombre}! Te contactaremos en menos de 24h.`;
            contactForm.reset();
            document.querySelectorAll('.form-hint').forEach(h => {
                h.textContent = '';
                h.classList.remove('error', 'success');
            });
        }, 1200);
    });
});
