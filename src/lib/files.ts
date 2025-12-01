/**
 * Downloads a file to the user's machine, given a filename and the contents as a string.
 */
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

/**
 * Opens a system dialog for the user to select a file. This file is then parsed into a string
 * and returned in a `Promise`.
 *
 * @param opts.accept  file types to accept. example: `'.jpg,.jpeg,.png'`
 */
export function uploadFileToString(opts: { accept?: string }): Promise<string> {
  return new Promise<string>((resolve) => {
    const element = document.createElement('input');
    element.setAttribute('type', 'file');
    element.style.display = 'none';
    if (opts.accept) element.setAttribute('accept', opts.accept);

    element.onchange = () => {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        resolve(reader.result as string);
      });

      reader.readAsText(element.files![0]);
    };
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  });
}
