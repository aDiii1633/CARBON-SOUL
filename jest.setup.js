import '@testing-library/jest-dom';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Define setImmediate for JSDOM / node mock compatibility
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));

const { Request, Response, Headers } = require('next/dist/compiled/@edge-runtime/primitives');
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

const { ReadableStream, TransformStream } = require('stream/web');
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;
