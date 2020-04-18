const deleteProduct = async (btn) => {
    console.log('Clicked');
    const prodID = btn.parentNode.querySelector('[name=productID]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement = btn.closest('article');
    try {
        const response = await fetch(`/admin/product/${prodID}`, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf
            }
        });
        console.log(response);
        if (response.status !== 500) {
            const data = await response.json();
            console.log('Response', data.message);
            productElement.parentNode.removeChild(productElement);
        } else {
            throw new Error('Failed deleting a product');
        }
        // productElement.remove();         
    } catch (err) {
        console.log(err);
    }
}