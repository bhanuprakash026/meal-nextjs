
// not-found.js file is the default file name in next.js when ever we created this file 
// next.js automatically find this file and renders when user wants to get the page which is not valid
export default function NotFound() {
    return (
        <main className="not-found">
            <h1>Meal Not Found</h1>
            <p>Unfortunatly we could not find the requested page or Meal Data.</p>
        </main>
    )
}