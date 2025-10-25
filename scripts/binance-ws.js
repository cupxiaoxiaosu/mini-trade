/**
 * 币安测试网 WebSocket 连接模块
 * 封装了与币安测试网的 WebSocket 连接逻辑
 */
class BinanceWebSocketClient {
    constructor(options = {}) {
        this.symbol = options.symbol || 'ethusdt';
        this.url = options.url || `wss://stream.testnet.binance.vision/ws/${this.symbol}@trade`;
        this.ws = null;
        this.isConnected = false;
        this.listeners = {
            open: [],
            message: [],
            error: [],
            close: []
        };
    }

    /**
     * 连接到币安测试网
     */
    connect() {
        try {
            // 如果已经连接，先断开
            if (this.ws) {
                this.disconnect();
            }

            // 创建新的 WebSocket 连接
            this.ws = new WebSocket(this.url);

            // 设置事件处理器
            this.ws.onopen = (event) => {
                this.isConnected = true;
                console.log(`成功连接到 Binance 测试网 - ${this.symbol.toUpperCase()}`);
                
                // 发送订阅消息
                const subscribeMessage = {
                    method: 'SUBSCRIBE',
                    params: [`${this.symbol}@trade`],
                    id: 1
                };
                this.ws.send(JSON.stringify(subscribeMessage));
                
                // 触发所有 open 事件监听器
                this.emit('open', event);
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    // 触发所有 message 事件监听器
                    this.emit('message', message);
                } catch (error) {
                    console.error('解析消息失败:', error.message);
                    this.emit('error', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket错误:', error);
                this.emit('error', error);
            };

            this.ws.onclose = (event) => {
                this.isConnected = false;
                console.log(`连接已关闭: ${event.code} - ${event.reason || '无原因'}`);
                this.emit('close', event);
            };

        } catch (error) {
            console.error('连接初始化失败:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }

    /**
     * 订阅事件
     * @param {string} eventType - 事件类型: 'open', 'message', 'error', 'close'
     * @param {Function} callback - 回调函数
     */
    on(eventType, callback) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].push(callback);
        }
        return this;
    }

    /**
     * 移除事件订阅
     * @param {string} eventType - 事件类型
     * @param {Function} callback - 要移除的回调函数，如果不提供则移除所有该类型的监听器
     */
    off(eventType, callback) {
        if (this.listeners[eventType]) {
            if (callback) {
                this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
            } else {
                this.listeners[eventType] = [];
            }
        }
        return this;
    }

    /**
     * 触发事件
     * @param {string} eventType - 事件类型
     * @param {*} data - 要传递给监听器的数据
     */
    emit(eventType, data) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件监听器执行错误 (${eventType}):`, error);
                }
            });
        }
    }

    /**
     * 获取连接状态
     * @returns {boolean} 是否已连接
     */
    getConnectionStatus() {
        return this.isConnected;
    }
}

// 导出模块
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BinanceWebSocketClient;
} else {
    // 浏览器环境
    window.BinanceWebSocketClient = BinanceWebSocketClient;
}