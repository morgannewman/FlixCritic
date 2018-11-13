/* exported log */

const LOG = true;

function log(message) {
  if (LOG) {
    // eslint-disable-next-line no-console
    console.log(message);
  }
}
