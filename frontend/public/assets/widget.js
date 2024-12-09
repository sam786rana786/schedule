// widget.js
(function() {
  // Ensure single initialization
  if (window.Scheduling) return;

  // Global Scheduling object
  window.Scheduling = {
    initInlineWidget: function(options = {}) {
      const containers = document.getElementsByClassName('scheduling-inline-widget');
      
      if (!containers.length) {
        console.warn('No scheduling widget containers found');
        return;
      }

      Array.from(containers).forEach(container => {
        const url = container.getAttribute('data-url');
        if (!url) {
          console.error('Missing data-url attribute on widget container');
          return;
        }

        // Create and append iframe
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          z-index: 9999;
        `;

        container.innerHTML = ''; // Clear loading state
        container.appendChild(iframe);

        // Call onLoad callback if provided
        if (typeof options.onLoad === 'function') {
          iframe.onload = options.onLoad;
        }
      });
    },

    initBadgeWidget: function(options) {
      const button = document.createElement('button');
      button.innerHTML = options.text || 'Schedule Meeting';
      button.style = `
        position: fixed;
        right: 20px;
        bottom: 20px;
        padding: 12px 24px;
        background: ${options.color || '#0055ff'};
        color: ${options.textColor || '#ffffff'};
        border: none;
        border-radius: 24px;
        cursor: pointer;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      `;
      
      button.onclick = () => this.showPopupWidget(options.url);
      document.body.appendChild(button);
    },

    showPopupWidget: function(url) {
      const overlay = document.createElement('div');
      overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
      `;
      overlay.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(document.querySelector('.scheduling-popup-iframe'));
      };

      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        border: none;
      `;
      iframe.classList.add('scheduling-popup-iframe');
      
      document.body.appendChild(overlay);
      document.body.appendChild(iframe);
      
      return false;
    }
  };
})();