/* exported log */

const LOG = false;

function log(message) {
  if (LOG) {
    // eslint-disable-next-line no-console
    console.log(message);
  }
}