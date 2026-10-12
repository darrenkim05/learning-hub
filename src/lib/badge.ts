// Header "N shaky" badge, live.
import { store, shakyCount } from './store';
const el = document.getElementById('shaky');
const paint = () => { if (el) el.textContent = `${shakyCount()} shaky`; };
store.onChange(paint);
paint();
