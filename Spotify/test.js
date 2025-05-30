(function() {
    'use strict';

    // 工具函数：读取 protobuf varint
    function readVarint(buffer) {
        let result = 0, shift = 0, byte;
        do {
            byte = buffer.readByte();
            result |= (byte & 0x7F) << shift;
            shift += 7;
        } while (byte & 0x80);
        return result;
    }

    // 工具函数：跳过指定类型长度
    function skipBytes(buffer, length) {
        buffer.offset += length;
    }

    // 工具函数：写入 varint
    function writeVarint(output, value) {
        while (value >= 0x80) {
            output.writeByte((value & 0x7F) | 0x80);
            value >>= 7;
        }
        output.writeByte(value);
    }

    // 工具函数：写入字符串
    function writeString(output, str) {
        const utf8 = new TextEncoder().encode(str);
        writeVarint(output, utf8.length);
        output.writeBytes(utf8);
    }

    // 解析并重写 protobuf 消息，注入自定义字段
    function transformResponse(bodyBytes) {
        const input = new ProtoReader(bodyBytes);
        const output = new ProtoWriter();

        // 递归地处理嵌套消息
        function processMessage(reader, writer) {
            while (!reader.eof()) {
                const tag = readVarint(reader);
                const fieldNumber = tag >>> 3;
                const wireType = tag & 0x7;

                switch (fieldNumber) {
                    case 1: // success
                        writeVarint(writer, tag);
                        const successLen = readVarint(reader);
                        const successBytes = reader.readBytes(successLen);
                        // 处理 success 对象
                        processMessage(new ProtoReader(successBytes), writer);
                        break;

                    case 3: // accountAttributesSuccess
                        writeVarint(writer, tag);
                        const accLen = readVarint(reader);
                        const accBytes = reader.readBytes(accLen);
                        // 注入 premium 权限
                        const fixedAcc = injectPremium(JSON.parse(decodeProtoMap(accBytes)));
                        const fixedAccBytes = encodeProtoMap(fixedAcc);
                        writeVarint(writer, fixedAccBytes.length);
                        writer.writeBytes(fixedAccBytes);
                        break;

                    default:
                        // 其他字段原样转发
                        writeVarint(writer, tag);
                        if (wireType === 2) {
                            const len = readVarint(reader);
                            writeVarint(writer, len);
                            const data = reader.readBytes(len);
                            writer.writeBytes(data);
                        } else if (wireType === 0) {
                            // varint
                            const v = readVarint(reader);
                            writeVarint(writer, v);
                        } else {
                            // 跳过不支持的类型
                            throw new Error('Unsupported wire type: ' + wireType);
                        }
                }
            }
        }

        processMessage(input, output);
        return output.getResult();
    }

    // 将 map 格式的 protoBytes 解码为 JS 对象
    function decodeProtoMap(bytes) {
        // 这里假设传入的 bytes 已经是 key/value 简单平铺结构
        // 省略实际实现，直接借用 JSON.parse
        return JSON.parse(new TextDecoder().decode(bytes));
    }

    // 将 JS 对象编码回 proto map bytes
    function encodeProtoMap(obj) {
        // 这里只是示例，将对象序列化为 JSON bytes
        return new TextEncoder().encode(JSON.stringify(obj));
    }

    // 注入或修改账号属性，开启 premium
    function injectPremium(accountAttrs) {
        const defaults = {
            ads: { boolValue: false },
            offline: { boolValue: true },
            "player-license": { stringValue: "premium" },
            type: { stringValue: "premium" }
        };
        return Object.assign({}, accountAttrs, defaults);
    }

    // 拦截响应并重写 body
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (url.includes('/u')) {
            this.addEventListener('load', function() {
                if (this.status === 200 && this.responseType === '' || this.responseType === 'arraybuffer') {
                    const body = new Uint8Array(this.response);
                    const newBody = transformResponse(body);
                    // 用新的 body 重写响应
                    Object.defineProperty(this, 'response', { value: newBody });
                    Object.defineProperty(this, 'responseText', { value: new TextDecoder().decode(newBody) });
                }
            });
        }
        return origOpen.apply(this, arguments);
    };

    // 简单的 Protobuf 读写辅助类（示例）
    function ProtoReader(bytes) {
        this.bytes = bytes;
        this.offset = 0;
        this.readByte = function() { return bytes[this.offset++]; };
        this.readBytes = function(len) {
            const slice = bytes.subarray(this.offset, this.offset + len);
            this.offset += len;
            return slice;
        };
        this.eof = function() { return this.offset >= bytes.length; };
    }
    function ProtoWriter() {
        const buffers = [];
        this.writeByte = function(b) { buffers.push(Uint8Array.of(b)); };
        this.writeBytes = function(bs) { buffers.push(bs); };
        this.getResult = function() {
            const totalLen = buffers.reduce((sum, b) => sum + b.length, 0);
            const result = new Uint8Array(totalLen);
            let pos = 0;
            for (const b of buffers) {
                result.set(b, pos);
                pos += b.length;
            }
            return result;
        };
    }

})();