/**
 * App.jsx — BuildMart root router
 *
 * Service routes:  /services/waste-sand  /services/debris-sand  /services/site-clean
 * Legacy routes:   /waste-sand  /debris-sand  /site-clean  → redirect to /services/…
 */

import { Component, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";

/* ── Lazy pages ──────────────────────────────────────────────────────────── */
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Calculator = lazy(() => import("./pages/Calculator"));
const WasteSandBooking = lazy(() => import("./pages/WasteSandBooking"));
const DebrisSandBooking = lazy(() => import("./pages/DebrisSandBooking"));
const SiteClean = lazy(() => import("./pages/SiteClean"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const About = lazy(() => import("./pages/About"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminBlogs = lazy(() => import("./pages/AdminBlogs"));

/* ── Loading skeleton ────────────────────────────────────────────────────── */
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-neutral-50">
    <div className="flex flex-col items-center gap-4">
      <svg
        className="w-10 h-10 animate-spin text-orange-400"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
        />
      </svg>
      <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
        Loading…
      </p>
    </div>
  </div>
);

/* ── Global error boundary ───────────────────────────────────────────────── */
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) {
    return { error: e };
  }
  componentDidCatch(e, info) {
    console.error("[BuildMart]", e, info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-black text-neutral-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-neutral-500 mb-6 leading-relaxed">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => {
                this.setState({ error: null });
                window.location.href = "/";
              }}
              className="bg-orange-400 border-2 border-neutral-900 font-bold px-6 py-2.5 rounded-xl"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-neutral-900 text-white font-bold px-6 py-2.5 rounded-xl"
            >
              Reload
            </button>
          </div>
          <details className="mt-6 text-left bg-red-50 border border-red-200 rounded-xl p-4">
            <summary className="cursor-pointer font-bold text-red-700 text-sm">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-red-800 whitespace-pre-wrap break-words overflow-x-auto">
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen bg-neutral-50">
                <Header />
                <main className="flex-grow">
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* ── Core pages ── */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route
                          path="/product/:id"
                          element={<ProductDetail />}
                        />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/calculator" element={<Calculator />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route
                          path="/track/:orderId"
                          element={<TrackOrder />}
                        />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <Admin />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/products"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <AdminProducts />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/blogs"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <AdminBlogs />
                            </ProtectedRoute>
                          }
                        />

                        {/* ── Service pages (canonical /services/ prefix) ── */}
                        <Route
                          path="/services/waste-sand"
                          element={<WasteSandBooking />}
                        />
                        <Route
                          path="/services/debris-sand"
                          element={<DebrisSandBooking />}
                        />
                        <Route
                          path="/services/site-clean"
                          element={<SiteClean />}
                        />

                        {/* ── Legacy redirects — keeps any old links alive ── */}
                        <Route
                          path="/waste-sand"
                          element={
                            <Navigate to="/services/waste-sand" replace />
                          }
                        />
                        <Route
                          path="/debris-sand"
                          element={
                            <Navigate to="/services/debris-sand" replace />
                          }
                        />
                        <Route
                          path="/site-clean"
                          element={
                            <Navigate to="/services/site-clean" replace />
                          }
                        />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </main>
                <Footer />
                <WhatsAppFloat />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
