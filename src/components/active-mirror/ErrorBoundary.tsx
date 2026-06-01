"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, ShieldOff, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MirrorGate Intercepted an Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-50/50 to-white overflow-hidden shadow-sm"
        >
          <div className="bg-red-500/10 px-4 py-3 border-b border-red-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldOff className="w-5 h-5 text-red-600" />
              <span className="text-sm font-semibold text-red-800 tracking-wide uppercase">
                MirrorGate Interception
              </span>
            </div>
            <span className="text-xs font-mono text-red-500/70">ERR_CORRUPT_PAYLOAD</span>
          </div>
          
          <div className="p-6 flex gap-4 items-start">
            <div className="p-3 bg-red-100 rounded-xl shrink-0">
              <AlertOctagon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-1">Payload Corrupted or Incomplete</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                The Sovereign OS intercepted a malformed or hallucinated response from the AI Engine. To protect enterprise safety boundaries, the rendering of this surface has been blocked.
              </p>
              
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 font-mono text-xs text-gray-500 mb-4 break-all">
                {this.state.errorMsg || "SyntaxError: Unexpected end of JSON input"}
              </div>

              <button
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Acknowledge & Recover
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
