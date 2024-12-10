import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Dashboard, Feedback, HomeLayout, Landing, Login, Logout, Register,Videocall, Whiteboard} from "./pages";
import { ToastContainer, toast } from 'react-toastify';
import { gapi } from 'gapi-script';
import { useEffect } from "react";
import { Navigate } from "react-router-dom";



const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "videocall",
        element: <Videocall />,
      },
      {
        path: "whiteboard",
        element: <Whiteboard />,
      },
      {
        path: "feedback",
        element: <Feedback />,
      }
    ],
  },
]);

function App() {

  useEffect(() => {
    function initGoogleAuth() {
      gapi.load('client:auth2', () => {
        gapi.auth2.init({
          client_id:'958782125962-34biajp0aaoei0v2q1889tcs54gbg99k.apps.googleusercontent.com',
          scope: 'email'
        }).then(() => {
          console.log("Google Auth initialized");
        }).catch(error => {
          console.error("Failed to initialize Google Auth:", error);
          toast.error("Google Authentication initialization failed");
        });
      });
    }
  
    initGoogleAuth();
  }, []);
  


  return (
    <>
        <RouterProvider router={router} />
        <ToastContainer position='top-center' />
    </>
  )
}

export default App