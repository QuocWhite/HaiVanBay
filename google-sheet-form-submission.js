// Google Apps Script URL for form submission
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzypIGPpBrHd28RuNiEEMpfM6_KdSHW_MlqneJElOyzrXKzCeMyG88L62HHLrshgvvh/exec';

// Add new fields to all Fusion forms
function addCustomFieldsToForms() {
    const forms = document.querySelectorAll('.fusion-form');
    
    forms.forEach(form => {
        const formId = form.classList.contains('fusion-form-586') ? '586' :
                      form.classList.contains('fusion-form-655') ? '655' :
                      form.classList.contains('fusion-form-1881') ? '1881' :
                      form.classList.contains('fusion-form-15') ? '15' : '';
        
        // Check if custom fields already added
        if (form.querySelector('.custom-muc-dich-field')) return;
        
        // Find the form fields container
        const formFields = form.querySelector('.fusion-form-fields');
        if (!formFields) return;
        
        // Create Mục đích field
        const mucDichField = document.createElement('div');
        mucDichField.className = 'fusion-form-field fusion-form-select-wrapper custom-muc-dich-field';
        mucDichField.style.marginBottom = '10px';
        mucDichField.innerHTML = `
            <label class="fusion-form-label" style="display:block;margin-bottom:5px;color:#333;font-weight:600;">Mục đích</label>
            <div class="fusion-form-select-wrapper">
                <select name="MucDich" class="fusion-form-input" required style="width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;">
                    <option value="">Chọn mục đích</option>
                    <option value="Mua để ở">Mua để ở</option>
                    <option value="Mua để đầu tư">Mua để đầu tư</option>
                </select>
            </div>
        `;
        
        // Create loại nhà field
        const loaiNhaField = document.createElement('div');
        loaiNhaField.className = 'fusion-form-field fusion-form-select-wrapper custom-loai-nha-field';
        loaiNhaField.style.marginBottom = '10px';
        loaiNhaField.innerHTML = `
            <label class="fusion-form-label" style="display:block;margin-bottom:5px;color:#333;font-weight:600;">Loại nhà</label>
            <div class="fusion-form-select-wrapper">
                <select name="LoaiNha" class="fusion-form-input" required style="width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;">
                    <option value="">Chọn loại nhà</option>
                    <option value="Biệt thự song lập">Biệt thự song lập</option>
                    <option value="Biệt thự đơn lập">Biệt thự đơn lập</option>
                    <option value="Liền kề">Liền kề</option>
                    <option value="Thương mại dịch vụ">Thương mại dịch vụ</option>
                </select>
            </div>
        `;
        
        // Insert fields after existing fields
        const submitButton = form.querySelector('.fusion-form-submit-button');
        if (submitButton && submitButton.parentNode) {
            formFields.insertBefore(loaiNhaField, submitButton);
            formFields.insertBefore(mucDichField, submitButton);
        }
    });
}

// Override form submission to send to Google Sheets
function overrideFormSubmission() {
    const forms = document.querySelectorAll('.fusion-form form');
    
    forms.forEach(form => {
        // Remove existing submit handlers
        const originalSubmit = form.submit;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get form data
            const formData = new FormData(form);
            const data = {};
            
            // Collect all form fields
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Add page info
            data['PageURL'] = window.location.href;
            data['PageTitle'] = document.title;
            data['SubmissionDate'] = new Date().toISOString();
            
            // Get form class to identify form type
            const formClass = Array.from(form.classList).find(c => c.match(/fusion-form-\d+/));
            data['FormID'] = formClass ? formClass.replace('fusion-form-', '') : 'unknown';
            
            // Show loading state
            const submitBtn = form.querySelector('.fusion-form-submit-button button, .fusion-button');
            const originalText = submitBtn ? submitBtn.innerText : 'Đang gửi...';
            if (submitBtn) {
                submitBtn.innerText = 'Đang gửi...';
                submitBtn.disabled = true;
            }
            
            // Send to Google Apps Script
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                // Show success message
                showSuccessMessage(form);
                
                // Reset form
                form.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            });
            
            return false;
        });
    });
}

// Show success message
function showSuccessMessage(form) {
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success-message';
    successDiv.style.cssText = `
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        margin-top: 15px;
        text-align: center;
        font-size: 16px;
        font-weight: 600;
    `;
    successDiv.innerHTML = '✓ Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.';
    
    // Remove old success message if exists
    const oldMsg = form.parentNode.querySelector('.form-success-message');
    if (oldMsg) oldMsg.remove();
    
    form.parentNode.appendChild(successDiv);
    
    // Hide after 5 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        addCustomFieldsToForms();
        setTimeout(overrideFormSubmission, 1000);
    });
} else {
    addCustomFieldsToForms();
    setTimeout(overrideFormSubmission, 1000);
}

// Also run on page load for dynamic content
window.addEventListener('load', function() {
    addCustomFieldsToForms();
    setTimeout(overrideFormSubmission, 1000);
});
