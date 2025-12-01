export function downloadStringAsFile(opts: { filename: string; content: string }) {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(opts.content),
  );
  element.setAttribute('download', opts.filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
