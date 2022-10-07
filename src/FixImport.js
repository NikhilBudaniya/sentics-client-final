import process from 'process'
import {Buffer} from 'buffer'

window.Buffer = Buffer;
window.process = process;

export {};