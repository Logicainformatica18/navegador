// =============================================
// CLASE CANCION: los datos que guarda cada nodo
// =============================================
class Cancion {
  constructor(titulo, artista) {
    this.titulo = titulo;
    this.artista = artista;
  }
}

// =============================================
// CLASE NODO: una caja de la lista enlazada
// =============================================
class Nodo {
  constructor(cancion) {
    this.cancion = cancion;   // dato
    this.siguiente = null;    // puntero al nodo siguiente
    this.anterior = null;     // puntero al nodo anterior
  }
}

// =============================================
// CLASE PLAYLIST: lista doblemente enlazada (NO circular)
// =============================================
class Playlist {
  constructor() {
    this.cabeza = null;   // primer nodo
    this.cola = null;     // último nodo
    this.actual = null;   // nodo que se está reproduciendo
    this.tamanio = 0;
  }

  estaVacia() {
    return this.tamanio === 0;
  }

  // Inserta al final: O(1) gracias a la cola
  agregarAlFinal(cancion) {
    const nuevo = new Nodo(cancion);

    if (this.estaVacia()) {
      this.cabeza = nuevo;
      this.cola = nuevo;
      this.actual = nuevo;
    } else {
      nuevo.anterior = this.cola;
      this.cola.siguiente = nuevo;
      this.cola = nuevo;
    }
    this.tamanio++;
  }

  // Inserta al inicio: O(1)
  agregarAlInicio(cancion) {
    const nuevo = new Nodo(cancion);

    if (this.estaVacia()) {
      this.cabeza = nuevo;
      this.cola = nuevo;
      this.actual = nuevo;
    } else {
      nuevo.siguiente = this.cabeza;
      this.cabeza.anterior = nuevo;
      this.cabeza = nuevo;
    }
    this.tamanio++;
  }

  // Avanza solo si existe un siguiente (no es circular)
  siguiente() {
    if (this.tieneSiguiente()) {
      this.actual = this.actual.siguiente;
      return true;
    }
    return false;
  }

  // Retrocede solo si existe un anterior (no es circular)
  anterior() {
    if (this.tieneAnterior()) {
      this.actual = this.actual.anterior;
      return true;
    }
    return false;
  }

  tieneSiguiente() {
    return this.actual !== null && this.actual.siguiente !== null;
  }

  tieneAnterior() {
    return this.actual !== null && this.actual.anterior !== null;
  }

  // Elimina el nodo actual y reconecta los vecinos
  eliminarActual() {
    if (this.estaVacia()) return null;

    const nodo = this.actual;
    const ant = nodo.anterior;
    const sig = nodo.siguiente;

    // Reconectar el anterior con el siguiente
    if (ant) ant.siguiente = sig;
    else this.cabeza = sig;          // era la cabeza

    if (sig) sig.anterior = ant;
    else this.cola = ant;            // era la cola

    // La nueva canción actual: la siguiente o, si no hay, la anterior
    this.actual = sig || ant;

    // Desconectar el nodo eliminado
    nodo.siguiente = null;
    nodo.anterior = null;

    this.tamanio--;
    return nodo.cancion;
  }

  // Posición (1, 2, 3...) del nodo actual
  posicionActual() {
    let pos = 1;
    let nodo = this.cabeza;
    while (nodo !== null) {
      if (nodo === this.actual) return pos;
      nodo = nodo.siguiente;
      pos++;
    }
    return 0;
  }

  // Convierte la lista en un arreglo de nodos (para dibujarla)
  aArreglo() {
    const nodos = [];
    let nodo = this.cabeza;
    while (nodo !== null) {
      nodos.push(nodo);
      nodo = nodo.siguiente;
    }
    return nodos;
  }

  // Mueve "actual" a un nodo específico
  irA(nodoDestino) {
    this.actual = nodoDestino;
  }
}

// =============================================
// CLASE INTERFAZ: conecta la Playlist con el HTML
// =============================================
class InterfazPlaylist {
  constructor(playlist) {
    this.playlist = playlist;

    // Referencias al DOM
    this.tituloActual = document.getElementById("tituloActual");
    this.artistaActual = document.getElementById("artistaActual");
    this.estado = document.getElementById("estado");
    this.posicion = document.getElementById("posicion");
    this.disco = document.getElementById("disco");
    this.inputTitulo = document.getElementById("inputTitulo");
    this.inputArtista = document.getElementById("inputArtista");
    this.mensaje = document.getElementById("mensaje");
    this.contenedorNodos = document.getElementById("contenedorNodos");

    this.btnAnterior = document.getElementById("btnAnterior");
    this.btnSiguiente = document.getElementById("btnSiguiente");
    this.btnEliminar = document.getElementById("btnEliminar");
    this.btnAgregarInicio = document.getElementById("btnAgregarInicio");
    this.btnAgregarFinal = document.getElementById("btnAgregarFinal");

    this.registrarEventos();
    this.render();
  }

  registrarEventos() {
    this.btnAnterior.addEventListener("click", () => {
      this.playlist.anterior();
      this.render();
    });

    this.btnSiguiente.addEventListener("click", () => {
      this.playlist.siguiente();
      this.render();
    });

    this.btnEliminar.addEventListener("click", () => {
      this.playlist.eliminarActual();
      this.render();
    });

    this.btnAgregarInicio.addEventListener("click", () => this.agregar("inicio"));
    this.btnAgregarFinal.addEventListener("click", () => this.agregar("final"));

    // Enter en los inputs agrega al final
    [this.inputTitulo, this.inputArtista].forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.agregar("final");
      });
    });
  }

  agregar(donde) {
    const titulo = this.inputTitulo.value.trim();
    const artista = this.inputArtista.value.trim();

    if (titulo === "" || artista === "") {
      this.mensaje.textContent = "Escribe el título y el artista para agregar la canción.";
      return;
    }

    const cancion = new Cancion(titulo, artista);

    if (donde === "inicio") this.playlist.agregarAlInicio(cancion);
    else this.playlist.agregarAlFinal(cancion);

    this.mensaje.textContent = "";
    this.inputTitulo.value = "";
    this.inputArtista.value = "";
    this.inputTitulo.focus();
    this.render();
  }

  render() {
    this.renderReproductor();
    this.renderNodos();
  }

  renderReproductor() {
    const p = this.playlist;

    if (p.estaVacia()) {
      this.estado.textContent = "Playlist vacía";
      this.tituloActual.textContent = "Agrega tu primera canción";
      this.artistaActual.textContent = "";
      this.posicion.textContent = "";
      this.disco.classList.remove("girando");
    } else {
      this.estado.textContent = "Reproduciendo";
      this.tituloActual.textContent = p.actual.cancion.titulo;
      this.artistaActual.textContent = p.actual.cancion.artista;
      this.posicion.textContent = `Canción ${p.posicionActual()} de ${p.tamanio}`;
      this.disco.classList.add("girando");
    }

    // Botones deshabilitados en los extremos (no es circular)
    this.btnAnterior.disabled = !p.tieneAnterior();
    this.btnSiguiente.disabled = !p.tieneSiguiente();
    this.btnEliminar.disabled = p.estaVacia();
  }

  renderNodos() {
    this.contenedorNodos.replaceChildren();

    if (this.playlist.estaVacia()) {
      const vacio = document.createElement("p");
      vacio.className = "vacio";
      vacio.textContent = "cabeza → null";
      this.contenedorNodos.appendChild(vacio);
      return;
    }

    // null a la izquierda de la cabeza
    this.contenedorNodos.appendChild(this.crearNull());

    this.playlist.aArreglo().forEach((nodo, i) => {
      this.contenedorNodos.appendChild(this.crearFlecha());
      this.contenedorNodos.appendChild(this.crearNodo(nodo, i + 1));
    });

    // null a la derecha de la cola
    this.contenedorNodos.appendChild(this.crearFlecha());
    this.contenedorNodos.appendChild(this.crearNull());
  }

  crearNodo(nodo, numero) {
    const caja = document.createElement("button");
    caja.className = "nodo";
    if (nodo === this.playlist.actual) caja.classList.add("activo");

    const titulo = document.createElement("div");
    titulo.className = "n-titulo";
    titulo.textContent = `${numero}. ${nodo.cancion.titulo}`;

    const artista = document.createElement("div");
    artista.className = "n-artista";
    artista.textContent = nodo.cancion.artista;

    const punteros = document.createElement("div");
    punteros.className = "n-punteros";
    const etiquetas = [];
    if (nodo === this.playlist.cabeza) etiquetas.push("cabeza");
    if (nodo === this.playlist.cola) etiquetas.push("cola");
    punteros.textContent = etiquetas.length ? etiquetas.join(" y ") : "nodo";

    caja.append(titulo, artista, punteros);
    caja.addEventListener("click", () => {
      this.playlist.irA(nodo);
      this.render();
    });

    return caja;
  }

  crearFlecha() {
    const flecha = document.createElement("span");
    flecha.className = "flecha";
    flecha.textContent = "⇄";
    return flecha;
  }

  crearNull() {
    const n = document.createElement("span");
    n.className = "null";
    n.textContent = "null";
    return n;
  }
}

// =============================================
// INICIO DE LA APLICACIÓN
// =============================================
const miPlaylist = new Playlist();

// Canciones de ejemplo para empezar
miPlaylist.agregarAlFinal(new Cancion("Bohemian Rhapsody", "Queen"));
miPlaylist.agregarAlFinal(new Cancion("Hotel California", "Eagles"));
miPlaylist.agregarAlFinal(new Cancion("Imagine", "John Lennon"));

const app = new InterfazPlaylist(miPlaylist);
