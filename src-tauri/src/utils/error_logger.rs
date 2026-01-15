use std::backtrace::Backtrace;
use std::fmt::{Debug, Display};
use tracing::error;

/// Logs an error with stack trace information.
/// This function captures the current backtrace and logs it along with the error.
///
/// # Arguments
/// * `context` - A description of where the error occurred (e.g., function name)
/// * `error` - The error to log (must implement Display)
pub fn log_error_with_trace<E: Display>(context: &str, error: &E) {
    let backtrace = Backtrace::force_capture();
    error!(
        context = context,
        error = %error,
        backtrace = %backtrace,
        "Error occurred"
    );
}

/// Logs an error with detailed debug information and stack trace.
/// Use this when you need full error details including nested causes.
///
/// # Arguments
/// * `context` - A description of where the error occurred
/// * `error` - The error to log (must implement Display + Debug)
pub fn log_error_detailed<E: Display + Debug>(context: &str, error: &E) {
    let backtrace = Backtrace::force_capture();
    error!(
        context = context,
        error = %error,
        error_debug = ?error,
        backtrace = %backtrace,
        "Error occurred"
    );
}

/// Extension trait for Result types to log errors with stack traces
pub trait ResultExt<T, E> {
    /// Maps the error and logs it with a stack trace
    fn log_err(self, context: &str) -> Result<T, E>;

    /// Maps the error to a new type and logs it with a stack trace
    fn map_err_log<F, N>(self, context: &str, op: F) -> Result<T, N>
    where
        F: FnOnce(E) -> N;
}

impl<T, E: Display> ResultExt<T, E> for Result<T, E> {
    fn log_err(self, context: &str) -> Result<T, E> {
        if let Err(ref e) = self {
            log_error_with_trace(context, e);
        }
        self
    }

    fn map_err_log<F, N>(self, context: &str, op: F) -> Result<T, N>
    where
        F: FnOnce(E) -> N,
    {
        self.map_err(|e| {
            log_error_with_trace(context, &e);
            op(e)
        })
    }
}
